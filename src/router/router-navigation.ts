/**
 * Router navigation methods - Public navigation API
 */

import type { NavigateOptions, RouteMatch } from "../router.types.js";
import type {
  DocumentWithViewTransitions,
  WindowWithNavigation,
} from "./browser-types.js";
import { HAS_VIEW_TRANSITIONS, ROUTER_PREFIX } from "./constants.js";

/**
 * Navigation configuration for navigate function
 */
export interface NavigationConfig {
  readonly basePath: string;
  readonly usingNavigationAPI: boolean;
  readonly handleNavigationFn: (path: string) => Promise<void>;
}

/**
 * Navigate to a path
 * Public API - declarative navigation
 *
 * @param path - Path to navigate to
 * @param options - Navigation options
 * @param config - Navigation configuration
 */
export async function navigate(
  path: string,
  options: NavigateOptions,
  config: NavigationConfig,
): Promise<void> {
  // Guard: Prevent navigation to external URLs
  try {
    const url = new URL(path, window.location.href);
    if (url.origin !== window.location.origin) {
      console.warn(
        `${ROUTER_PREFIX} Cannot programmatically navigate to external URL:`,
        path,
      );
      return;
    }
  } catch {
    // Relative URL, continue
  }

  const fullPath = config.basePath + path;

  // Update browser history - use Navigation API if available
  if (config.usingNavigationAPI) {
    const nav = (window as unknown as WindowWithNavigation).navigation;
    nav.navigate(fullPath, {
      state: options.state,
      history: options.replace === true ? "replace" : "push",
    });
  } else {
    if (options.replace === true) {
      window.history.replaceState(options.state ?? {}, "", fullPath);
    } else {
      window.history.pushState(options.state ?? {}, "", fullPath);
    }
  }

  // Handle navigation
  await config.handleNavigationFn(path);

  // Scroll to top if requested (default: true)
  if (options.scroll !== false) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Notify all subscribers of route change
 * @param match - Current route match
 * @param listeners - Set of listener functions
 * @param onError - Error handler
 */
export function notifyListeners(
  match: RouteMatch | null,
  listeners: ReadonlySet<(match: RouteMatch | null) => void>,
  onError: (error: { readonly type: "unknown"; readonly error: Error }) => void,
): void {
  listeners.forEach((listener) => {
    try {
      listener(match);
    } catch (error) {
      onError({
        type: "unknown",
        error: error as Error,
      });
    }
  });
}

/**
 * Notify subscribers with View Transitions API if available
 * @param viewTransitionsEnabled - Whether view transitions are enabled
 * @param notifyFn - Function to notify listeners
 */
export function notifyWithTransition(
  viewTransitionsEnabled: boolean,
  notifyFn: () => void,
): void {
  if (viewTransitionsEnabled && HAS_VIEW_TRANSITIONS) {
    (document as DocumentWithViewTransitions).startViewTransition(() => {
      notifyFn();
    });
  } else {
    notifyFn();
  }
}
