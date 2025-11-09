/**
 * Constants and feature detection for the router
 */

/**
 * Check if URLPattern API is available (modern browsers)
 */
export const HAS_URL_PATTERN = typeof URLPattern !== "undefined";

/**
 * Check if View Transitions API is available
 * Chrome 111+, Edge 111+, Safari 18+
 */
export const HAS_VIEW_TRANSITIONS =
  typeof document !== "undefined" &&
  "startViewTransition" in document &&
  typeof (document as unknown as { readonly startViewTransition?: unknown })
    .startViewTransition === "function";

/**
 * Check if Navigation API is available
 * Chrome 102+, Edge 102+, Opera 88+
 * NOT available in Safari or Firefox
 */
export const HAS_NAVIGATION_API =
  typeof window !== "undefined" &&
  "navigation" in window &&
  typeof (window as unknown as { readonly navigation?: unknown }).navigation !==
    "undefined";

/**
 * Router log prefix for consistent console messages
 */
export const ROUTER_PREFIX = "[Router]";
