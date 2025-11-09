/**
 * Overhead Router: Type-safe, declarative routing for modern web apps
 *
 * This file re-exports all router types from focused modules.
 * See ./router/types/* for individual type definitions.
 */

export type {
  // Type utilities
  ExtractParams,
  InferRouteData,
  InferRouteParams,
  InferRouteComponent,

  // Route and configuration
  GuardResult,
  LoaderContext,
  CacheStrategy,
  CacheConfig,
  Route,
  RouterConfig,

  // Navigation
  RouteMatch,
  NavigateOptions,
  CompiledRoute,
  RouterState,
  NavigationError,

  // Registry
  RouteRegistry,
  RouteNames,
  RouteByName,
} from "./router/types/index.js";

export {
  // Redirect
  RedirectResponse,
  redirect,

  // Registry functions
  createRouteRegistry,
  matchesRoute,
} from "./router/types/index.js";
