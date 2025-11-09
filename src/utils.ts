/**
 * Utility functions for declarative, type-safe routing
 *
 * This file re-exports all utilities from focused modules.
 * See ./utils/* for individual utility definitions.
 */

export {
  // URL utilities
  buildPath,
  buildQuery,
  buildUrl,

  // Preload utilities
  preloadRoute,
  preloadRoutes,
  createPrefetchHandler,

  // Performance utilities
  debounce,
  PerformanceMonitor,

  // Scroll restoration
  ScrollRestoration,

  // Path utilities
  pathMatches,
  getActiveClass,
  createRouteBuilder,
  validatePath,
} from "./utils/index.js";

export type { PerformanceMetrics } from "./utils/index.js";
