/**
 * Navigation handling logic - Core navigation flow with guards, loaders, and error handling
 */

import type { RouteMatch, NavigationError } from "../router.types.js";
import { RedirectResponse } from "../router.types.js";
import { runGuard } from "./guard-handler.js";
import { loadRouteData } from "./loader-handler.js";

/**
 * Configuration for navigation handlers
 */
export interface NavigationConfig {
  readonly notFound: () => void | Promise<void>;
  readonly unauthorized: () => void | Promise<void>;
  readonly onError: (error: NavigationError) => void;
  readonly hooks?: {
    readonly beforeNavigate?: (path: string) => boolean | Promise<boolean>;
    readonly afterNavigate?: (path: string) => void | Promise<void>;
  };
  readonly base: string;
}

/**
 * Navigation context for handlers
 */
export interface NavigationContext {
  readonly notifyWithTransition: (match: RouteMatch | null) => void;
  readonly restoreHistory: () => void;
}

/**
 * Navigation pipeline - groups navigation dependencies
 */
export interface NavigationPipeline {
  readonly controller: AbortController;
  readonly config: NavigationConfig;
  readonly context: NavigationContext;
}

/**
 * Run beforeNavigate hook if present
 */
async function runBeforeNavigateHook(
  path: string,
  config: NavigationConfig,
): Promise<boolean> {
  if (config.hooks?.beforeNavigate !== undefined) {
    return await config.hooks.beforeNavigate(path);
  }
  return true;
}

/**
 * Create enriched match and notify subscribers
 */
async function finalizeNavigation(
  match: RouteMatch,
  data: unknown,
  path: string,
  pipeline: NavigationPipeline,
): Promise<RouteMatch> {
  const enrichedMatch: RouteMatch = {
    ...match,
    data: data ?? undefined,
  };

  pipeline.context.notifyWithTransition(enrichedMatch);

  if (pipeline.config.hooks?.afterNavigate !== undefined) {
    await pipeline.config.hooks.afterNavigate(path);
  }

  return enrichedMatch;
}

/**
 * Handle navigation errors
 */
function handleNavigationError(error: unknown, config: NavigationConfig): null {
  if (error instanceof RedirectResponse) {
    throw error;
  }

  if ((error as Error).name === "AbortError") {
    return null;
  }

  config.onError({
    type: "unknown",
    error: error as Error,
  });

  return null;
}

/**
 * Handle navigation to a path with abort support
 *
 * CRITICAL: This method prevents race conditions in async navigation.
 * Multiple rapid navigations (user clicking links quickly) could cause:
 * - Stale data being displayed (slow loader finishes after fast one)
 * - Memory leaks (abandoned promises still running)
 * - Incorrect route state (older navigation overwrites newer one)
 *
 * Solution: AbortController pattern
 * - Each navigation gets unique AbortController
 * - Starting new navigation aborts previous one
 * - Aborted operations short-circuit and clean up
 * - Loaders receive signal to cancel fetch() calls
 *
 * Performance optimizations:
 * - Guards short-circuit (fail fast, don't waste work)
 * - Parallel loading (loader + component when both exist)
 * - Lazy loading (components loaded on-demand)
 * - Memoized matching (LRU cache for route lookups)
 *
 * Abort points (operations check signal):
 * 1. After beforeNavigate hook
 * 2. After route matching
 * 3. After guard check
 * 4. After loader completes
 * 5. Before updating state
 *
 * Common pitfalls:
 * - DON'T remove abort checks (causes race conditions)
 * - DON'T ignore AbortError (clutters error logs)
 * - DON'T forget to pass signal to loaders (fetch won't cancel)
 * - DON'T await after abort check (might be aborted during await)
 *
 * @param path - Route path to navigate to
 * @param match - Matched route (or null if not found)
 * @param pipeline - Navigation pipeline (controller, config, context)
 * @returns Enriched match with loaded data
 */
export async function handleNavigation(
  path: string,
  match: RouteMatch | null,
  pipeline: NavigationPipeline,
): Promise<RouteMatch | null> {
  try {
    // Run beforeNavigate hook
    const allowed = await runBeforeNavigateHook(path, pipeline.config);
    if (!allowed) return null;

    if (pipeline.controller.signal.aborted) return null;

    // Handle not found
    if (match === null) {
      return handleNotFound(path, pipeline.config, pipeline.context);
    }

    if (pipeline.controller.signal.aborted) return null;

    // Run guard and process result
    const guardResult = await runGuard(match, path, pipeline.config);
    if (guardResult.type === "denied") return null;

    // Handle redirect
    if (guardResult.type === "redirect") {
      throw new RedirectResponse(
        guardResult.path,
        guardResult.replace ?? false,
      );
    }

    if (pipeline.controller.signal.aborted) return null;

    // Load data and component (guardResult.type is now "allowed")
    const data = await loadRouteData(
      match,
      pipeline.controller,
      pipeline.config,
      guardResult.context,
    );

    if (pipeline.controller.signal.aborted) return null;

    // Create enriched match and notify
    return await finalizeNavigation(match, data, path, pipeline);
  } catch (error) {
    return handleNavigationError(error, pipeline.config);
  }
}

/**
 * Handle not found route
 */
async function handleNotFound(
  path: string,
  config: NavigationConfig,
  context: NavigationContext,
): Promise<null> {
  // Restore previous history state
  context.restoreHistory();

  // Emit not-found error to onError handler
  config.onError({
    type: "not-found",
    path,
  });

  await config.notFound();
  context.notifyWithTransition(null);
  return null;
}
