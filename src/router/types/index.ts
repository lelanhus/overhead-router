/**
 * Router types - re-export all type definitions
 */

// Type utilities
export type {
  ExtractParams,
  InferRouteData,
  InferRouteParams,
  InferRouteComponent,
} from "./type-utils.js";

// Redirect
export { RedirectResponse, redirect } from "./redirect.js";

// Route and configuration
export type {
  GuardResult,
  LoaderContext,
  CacheStrategy,
  CacheConfig,
  Route,
  RouterConfig,
} from "./route.js";

// Navigation
export type {
  RouteMatch,
  NavigateOptions,
  CompiledRoute,
  RouterState,
  NavigationError,
} from "./navigation.js";

// Registry
export type { RouteRegistry, RouteNames, RouteByName } from "./registry.js";
export { createRouteRegistry, matchesRoute } from "./registry.js";
