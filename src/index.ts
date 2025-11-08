/**
 * sane-router: Declarative, type-safe routing
 * @module sane-router
 */

export { Router, createRouter, route } from "./router.js";
export type {
  Route,
  RouterConfig,
  RouteMatch,
  NavigateOptions,
  ExtractParams,
} from "./router.types.js";
