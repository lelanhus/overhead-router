/**
 * sane-router: Declarative, type-safe routing
 * Platform-first router for modern web applications
 * @module sane-router
 */

// Core router exports
export { Router, createRouter } from "./router.js";
export { route } from "./route-factory.js";

// Type utilities for E2E type safety
export {
  createRouteRegistry,
  matchesRoute,
  redirect,
  RedirectResponse,
} from "./router.types.js";

// Core types
export type {
  Route,
  RouterConfig,
  RouteMatch,
  NavigateOptions,
  ExtractParams,
  LoaderContext,
  GuardResult,
  CacheStrategy,
  CacheConfig,
  RouterState,
  NavigationError,
} from "./router.types.js";

// Type inference utilities
export type {
  InferRouteData,
  InferRouteParams,
  InferRouteComponent,
  RouteRegistry,
  RouteNames,
  RouteByName,
} from "./router.types.js";
