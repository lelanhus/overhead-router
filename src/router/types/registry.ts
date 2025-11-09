/**
 * Route registry types and utilities for type-safe route management
 */

import type { RouteMatch } from "./navigation.js";
import type { Route } from "./route.js";
import type { InferRouteData } from "./type-utils.js";

/**
 * Type-safe route registry pattern
 * Use with `as const` for full type inference
 * @example
 * const routes = {
 *   home: route('/', { ... }),
 *   product: route('/products/:id', { ... })
 * } as const
 */
export type RouteRegistry = Record<string, Route>;

/**
 * Extract route names from a registry
 */
export type RouteNames<R extends RouteRegistry> = keyof R;

/**
 * Get a specific route by name from a registry
 */
export type RouteByName<R extends RouteRegistry, K extends keyof R> = R[K];

/**
 * Create a typed route registry
 * Preserves const inference for route names
 */
export function createRouteRegistry<T extends RouteRegistry>(routes: T): T {
  return routes;
}

/**
 * Type guard for route matching with type narrowing
 * Narrows RouteMatch type to include inferred data type
 *
 * @example
 * const match = router.getCurrentMatch()
 * if (matchesRoute(match, routes.product)) {
 *   match.data // Type: Product (fully typed!)
 *   match.params.id // Type: string
 * }
 */
export function matchesRoute<R extends Route>(
  match: RouteMatch | null,
  route: R,
): match is RouteMatch<
  R extends Route<infer Path, unknown, unknown> ? Path : string,
  InferRouteData<R>
> & { readonly route: R } {
  return match?.route === route;
}
