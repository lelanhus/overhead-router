/**
 * Event listener setup for browser navigation
 */

import type { RouteMatch } from "../router.types.js";
import { ROUTER_PREFIX } from "./constants.js";

/**
 * Event handler storage for proper cleanup
 */
export interface EventHandlers {
  readonly clickHandler: ((e: Event) => void) | null;
  readonly popstateHandler: (() => void) | null;
  readonly hashchangeHandler: (() => void) | null;
}

/**
 * Router methods needed by event handlers
 */
export interface RouterMethods {
  readonly getCurrentPath: () => string;
  readonly handleNavigation: (path: string) => Promise<void>;
  readonly handleHashChange: () => void;
  readonly navigate: (path: string) => Promise<void>;
  readonly basePathRegex: RegExp | null;
  readonly base: string;
}

/**
 * Set up browser event listeners
 * Performance: Single delegated listener for all links
 *
 * @param methods - Router methods needed by event handlers
 * @returns EventHandlers object with registered listeners
 */
export function setupEventListeners(methods: RouterMethods): EventHandlers {
  // Handle popstate (back/forward buttons)
  const popstateHandler = () => {
    void (async () => {
      try {
        // Validate we're in a valid state
        const currentPath = methods.getCurrentPath();

        // Guard: Ensure path is valid
        if (currentPath === "" || currentPath === "undefined") {
          console.warn(`${ROUTER_PREFIX} Invalid path on popstate, reloading`);
          window.location.reload();
          return;
        }

        // Attempt navigation with error handling
        await methods.handleNavigation(currentPath);
      } catch (error) {
        console.error(`${ROUTER_PREFIX} Popstate navigation failed:`, error);

        // Fallback: Try to navigate to home or reload
        try {
          await methods.navigate("/");
        } catch {
          window.location.reload();
        }
      }
    })();
  };
  window.addEventListener("popstate", popstateHandler);

  // Handle hash changes (for hash-only navigation)
  const hashchangeHandler = () => {
    methods.handleHashChange();
  };
  window.addEventListener("hashchange", hashchangeHandler);

  // Intercept all link clicks with comprehensive guards
  const clickHandler = createClickHandler(methods);
  document.addEventListener("click", clickHandler);

  return {
    popstateHandler,
    hashchangeHandler,
    clickHandler,
  };
}

/**
 * Check if click should be handled by browser (modifier keys pressed)
 */
function hasModifierKeys(e: MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/**
 * Find anchor element from click target
 */
function findAnchorElement(target: Element): HTMLAnchorElement | null {
  return target.tagName === "A"
    ? (target as HTMLAnchorElement)
    : target.closest<HTMLAnchorElement>("a[href]");
}

/**
 * Check if anchor should bypass SPA navigation
 */
function shouldBypassNavigation(anchor: HTMLAnchorElement): boolean {
  const targetAttr = anchor.getAttribute("target");
  return (
    anchor.hasAttribute("download") ||
    (targetAttr !== null && targetAttr !== "_self") ||
    anchor.hasAttribute("data-external") ||
    anchor.getAttribute("rel") === "external"
  );
}

/**
 * Handle hash-only navigation
 */
function handleHashNavigation(e: Event, href: string): boolean {
  if (href.startsWith("#")) {
    e.preventDefault();
    window.location.hash = href;
    return true; // Handled
  }
  return false; // Not a hash link
}

/**
 * Process same-origin navigation
 */
function processSameOriginLink(
  e: Event,
  href: string,
  methods: RouterMethods,
): void {
  try {
    const linkUrl = new URL(href, window.location.href);
    if (linkUrl.origin !== window.location.origin) return;

    e.preventDefault();
    const pathname = linkUrl.pathname;
    const pathWithoutBase =
      methods.basePathRegex !== null
        ? pathname.replace(methods.basePathRegex, "")
        : pathname;
    void methods.navigate(pathWithoutBase + linkUrl.search + linkUrl.hash);
  } catch {
    // Invalid URL - let browser handle
  }
}

/**
 * Create click handler with comprehensive guards
 * SECURITY-CRITICAL: These guards prevent navigation hijacking and XSS attacks
 */
function createClickHandler(methods: RouterMethods): (e: Event) => void {
  return (e: Event) => {
    const mouseEvent = e as MouseEvent;

    // Early return guards
    if (e.defaultPrevented) return;
    if (mouseEvent.button !== 0) return;
    if (hasModifierKeys(mouseEvent)) return;
    if (!(e.target instanceof Element)) return;

    const anchor = findAnchorElement(e.target);
    if (anchor === null) return;

    const href = anchor.getAttribute("href");
    if (href === null) return;
    if (shouldBypassNavigation(anchor)) return;
    if (handleHashNavigation(e, href)) return;

    processSameOriginLink(e, href, methods);
  };
}

/**
 * Remove all event listeners
 * Prevents memory leaks when destroying router
 */
export function removeEventListeners(handlers: EventHandlers): void {
  if (handlers.clickHandler !== null) {
    document.removeEventListener("click", handlers.clickHandler);
  }

  if (handlers.popstateHandler !== null) {
    window.removeEventListener("popstate", handlers.popstateHandler);
  }

  if (handlers.hashchangeHandler !== null) {
    window.removeEventListener("hashchange", handlers.hashchangeHandler);
  }
}

/**
 * Handle hash-only changes (no full navigation)
 * Updates match with new hash and notifies subscribers
 */
export function handleHashChange(
  currentMatch: RouteMatch | null,
  notifyFn: (match: RouteMatch) => void,
): RouteMatch | null {
  if (currentMatch === null) return null;

  // Update match with new hash, keep everything else
  const updatedMatch: RouteMatch = {
    ...currentMatch,
    hash: window.location.hash,
  };

  notifyFn(updatedMatch);
  return updatedMatch;
}
