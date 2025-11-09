/**
 * Utility functions - re-export all utilities
 */

// URL utilities
export { buildPath, buildQuery, buildUrl } from "./url.js";

// Preload utilities
export {
  preloadRoute,
  preloadRoutes,
  createPrefetchHandler,
} from "./preload.js";

// Performance utilities
export { debounce, PerformanceMonitor } from "./performance.js";
export type { PerformanceMetrics } from "./performance.js";

// Scroll restoration
export { ScrollRestoration } from "./scroll.js";

// Path utilities
export {
  pathMatches,
  getActiveClass,
  createRouteBuilder,
  validatePath,
} from "./path.js";
