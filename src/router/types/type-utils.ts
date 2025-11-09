/**
 * Type utilities for route parameter extraction and inference
 */

import type { Route } from "./route.js";

/**
 * Extract parameter names from a path string using recursive template literal types
 *
 * This type provides compile-time route parameter validation with ZERO runtime cost.
 * The TypeScript compiler infers parameter types directly from route path templates.
 *
 * @example ExtractParams<'/users/:id/posts/:postId'> = { id: string; postId: string }
 *
 * CRITICAL: DO NOT SIMPLIFY to Record<string, string>
 * This would break type inference and lose compile-time route validation.
 *
 * How it works:
 * 1. Pattern matches against '/:param/' (middle parameters)
 * 2. Recursively processes remaining Suffix
 * 3. Combines results using intersection (&)
 * 4. Falls back to '/:param' for final parameter
 * 5. Returns Record<string, never> for paths without parameters
 *
 * Performance: Computed at compile-time, zero runtime overhead
 * Type safety: Invalid parameter access is a compile error, not runtime error
 */
export type ExtractParams<Path extends string> =
  Path extends `${infer _Prefix}/:${infer Param}/${infer Suffix}`
    ? { readonly [K in Param]: string } & ExtractParams<Suffix>
    : Path extends `${infer _Prefix}/:${infer Param}`
      ? { readonly [K in Param]: string }
      : Record<string, never>;

/**
 * Infer the data type returned by a route's loader
 */
export type InferRouteData<R> =
  R extends Route<string, unknown, infer TData> ? TData : never;

/**
 * Infer the parameter types from a route's path
 */
export type InferRouteParams<R> =
  R extends Route<infer Path, unknown, unknown> ? ExtractParams<Path> : never;

/**
 * Infer the component type from a route
 */
export type InferRouteComponent<R> =
  R extends Route<string, infer TComponent, unknown> ? TComponent : never;
