/**
 * Route factory function for creating type-safe route definitions
 */

import type {
  Route,
  ExtractParams,
  LoaderContext,
  GuardResult,
  CacheStrategy,
  CacheConfig,
} from "./router.types.js";

/**
 * Create a type-safe route definition with automatic parameter extraction
 *
 * This function creates route definitions with end-to-end type safety. TypeScript
 * automatically infers route parameters from the path pattern, loader return types,
 * and component types - all at compile-time with zero runtime overhead.
 *
 * Supports two API styles:
 * - **New API** (recommended): Single config object with full type inference
 * - **Legacy API**: Two parameters (path, config) for backward compatibility
 *
 * @param pathOrConfig - Either a path string (legacy) or a config object (new API)
 * @param config - Route configuration (only when using legacy API)
 *
 * @returns Type-safe route definition with inferred parameter and data types
 *
 * @example
 * // Basic route (new API - recommended)
 * const homeRoute = route({
 *   path: '/',
 *   component: () => import('./pages/home')
 * });
 *
 * @example
 * // Route with parameters and loader (new API)
 * const productRoute = route({
 *   path: '/products/:id',
 *   loader: async ({ params, signal }) => {
 *     // params is typed as { id: string }
 *     const res = await fetch(`/api/products/${params.id}`, { signal });
 *     return res.json();
 *   },
 *   component: () => import('./pages/product')
 * });
 *
 * @example
 * // Route with guard and context passing
 * const dashboardRoute = route({
 *   path: '/dashboard',
 *   guard: async (params) => {
 *     const user = await getCurrentUser();
 *     if (!user) return { redirect: '/login' };
 *     if (!user.isPremium) return { deny: true, reason: 'Premium required' };
 *     return { allow: true, context: { user } };
 *   },
 *   loader: async ({ context }) => {
 *     // context.user is available from guard
 *     return fetchDashboard(context.user);
 *   },
 *   component: () => import('./pages/dashboard')
 * });
 *
 * @example
 * // Route with cache configuration
 * const searchRoute = route({
 *   path: '/search',
 *   cache: { strategy: 'query', maxAge: 60000 }, // Cache for 1 minute
 *   loader: async ({ query }) => {
 *     const q = query.get('q');
 *     return searchAPI(q);
 *   },
 *   component: () => import('./pages/search')
 * });
 *
 * @example
 * // Nested routes
 * const adminRoute = route({
 *   path: '/admin',
 *   guard: (params) => checkAdminRole(),
 *   component: () => import('./pages/admin'),
 *   children: [
 *     route({ path: '/admin/users', component: () => import('./pages/admin/users') }),
 *     route({ path: '/admin/settings', component: () => import('./pages/admin/settings') })
 *   ]
 * });
 *
 * @example
 * // Legacy API (backward compatible)
 * const productRoute = route('/products/:id', {
 *   component: () => import('./pages/product'),
 *   loader: async ({ params }) => fetchProduct(params.id)
 * });
 *
 * @see {@link Route} for full route configuration options
 * @see {@link ExtractParams} for parameter type extraction
 * @see {@link LoaderContext} for loader context structure
 * @see {@link GuardResult} for guard return types
 */

// New API overload - single config object (preferred)
export function route<
  const Path extends string,
  TData = unknown,
  TComponent = unknown,
>(config: {
  readonly path: Path;
  readonly component: () => Promise<TComponent> | TComponent;
  readonly guard?: (
    params: ExtractParams<Path>,
  ) => GuardResult | Promise<GuardResult>;
  readonly loader?: (context: LoaderContext<Path>) => Promise<TData> | TData;
  readonly children?: ReadonlyArray<Route>;
  readonly meta?: Readonly<Record<string, unknown>>;
  readonly cache?: CacheStrategy | CacheConfig;
}): Route<Path, TComponent, Awaited<TData>>;

// Legacy API overload - two parameters (backward compatible)
export function route<Path extends string>(
  path: Path,
  config: Omit<Route<Path>, "path">,
): Route<Path>;

// Implementation
export function route<
  const Path extends string,
  TData = unknown,
  TComponent = unknown,
>(
  pathOrConfig:
    | Path
    | {
        readonly path: Path;
        readonly component: () => Promise<TComponent> | TComponent;
        readonly guard?: (
          params: ExtractParams<Path>,
        ) => GuardResult | Promise<GuardResult>;
        readonly loader?: (
          context: LoaderContext<Path>,
        ) => Promise<TData> | TData;
        readonly children?: ReadonlyArray<Route>;
        readonly meta?: Readonly<Record<string, unknown>>;
        readonly cache?: CacheStrategy | CacheConfig;
      },
  config?: Omit<Route<Path>, "path">,
): Route<Path, TComponent, Awaited<TData>> | Route<Path> {
  if (typeof pathOrConfig === "object" && "path" in pathOrConfig) {
    return pathOrConfig as Route<Path, TComponent, Awaited<TData>>;
  }

  const path = pathOrConfig;
  return { path, ...config } as Route<Path>;
}
