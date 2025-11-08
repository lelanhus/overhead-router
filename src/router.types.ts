/**
 * Overhead Router: Type-safe, declarative routing for modern web apps
 * Designed for performance, simplicity, and semantic HTML
 */

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
    ? { [K in Param]: string } & ExtractParams<Suffix>
    : Path extends `${infer _Prefix}/:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

/**
 * Branded type for validated paths
 * Provides compile-time safety for path strings
 */
export type ValidPath = string & { readonly __brand: 'ValidPath' };

/**
 * Loader context passed to route loaders
 * Provides access to params, query, hash, and abort signal
 */
export interface LoaderContext<Path extends string = string> {
  /** Path parameters extracted from route pattern */
  readonly params: ExtractParams<Path>;

  /** URL query parameters */
  readonly query: URLSearchParams;

  /** URL hash (including #) */
  readonly hash: string;

  /** AbortSignal for cancelling async operations */
  readonly signal: AbortSignal;
}

/**
 * Route definition - declarative configuration
 * @template Path - URL path pattern
 * @template TComponent - Component type
 * @template TData - Data loader return type
 */
export interface Route<
  Path extends string = string,
  TComponent = unknown,
  TData = unknown
> {
  /** URL path pattern with :param syntax */
  readonly path: Path;

  /** Lazy-loaded component/handler */
  component: () => Promise<TComponent> | TComponent;

  /** Optional route guard (return false to block navigation) */
  guard?: (params: ExtractParams<Path>) => boolean | Promise<boolean>;

  /** Optional data loader (called before rendering) */
  loader?: (context: LoaderContext<Path>) => Promise<TData> | TData;

  /** Child routes for nesting */
  readonly children?: ReadonlyArray<Route>;

  /** Route metadata (for breadcrumbs, titles, etc.) */
  readonly meta?: Readonly<Record<string, unknown>>;
}

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Route definitions */
  readonly routes: ReadonlyArray<Route>;

  /** Base path for all routes (default: '') */
  readonly base?: string;

  /** 404 handler */
  readonly notFound?: () => void | Promise<void>;

  /** Unauthorized handler (guard failed) */
  readonly unauthorized?: () => void | Promise<void>;

  /** Error handler */
  readonly onError?: (error: NavigationError) => void;

  /** Navigation hooks */
  readonly hooks?: {
    readonly beforeNavigate?: (path: string) => boolean | Promise<boolean>;
    readonly afterNavigate?: (path: string) => void | Promise<void>;
  };

  /** SSR mode - skip browser API setup (default: false) */
  readonly ssr?: boolean;
}

/**
 * Route match result
 */
export interface RouteMatch<Path extends string = string, TData = unknown> {
  readonly route: Route<Path>;
  readonly params: ExtractParams<Path>;
  readonly query: URLSearchParams;
  readonly hash: string; // URL hash (including #)
  readonly path: string;
  readonly data?: TData; // Data loaded from route.loader()
}

/**
 * Navigation options
 */
export interface NavigateOptions {
  /** Replace current history entry instead of pushing */
  readonly replace?: boolean;

  /** Scroll to top after navigation */
  readonly scroll?: boolean;

  /** Custom state to store in history */
  readonly state?: unknown;
}

/**
 * Compiled route for performance
 * @internal
 */
export interface CompiledRoute<Path extends string = string> {
  readonly route: Route<Path>;
  readonly pattern: URLPattern | RegExp;
  readonly paramNames: readonly string[];
}

/**
 * Router state - discriminated union for type-safe state management
 *
 * Uses the discriminated union pattern with a 'status' field to enable
 * exhaustive pattern matching and type narrowing.
 *
 * @example
 * function handleState(state: RouterState) {
 *   switch (state.status) {
 *     case 'matched':
 *       // TypeScript knows state.match exists here
 *       return state.match.route;
 *     case 'error':
 *       // TypeScript knows state.error exists here
 *       return state.error;
 *     // ... handle other cases
 *   }
 *   // TypeScript will error if you miss a case (exhaustive checking)
 * }
 */
export type RouterState =
  | { readonly status: 'idle' }
  | { readonly status: 'navigating'; readonly path: string }
  | { readonly status: 'matched'; readonly match: RouteMatch }
  | { readonly status: 'error'; readonly error: NavigationError };

/**
 * Navigation errors - discriminated union for type-safe error handling
 *
 * CRITICAL: This discriminated union pattern enforces exhaustive error handling.
 * The 'type' field enables TypeScript to narrow types in switch statements.
 *
 * Benefits:
 * - Compile-time guarantee all error cases are handled
 * - Type narrowing gives access to case-specific fields
 * - Adding new error types causes compile errors in incomplete handlers
 * - Self-documenting - all error cases visible in one place
 *
 * Common pitfalls:
 * - Don't add a generic 'catch-all' case - breaks exhaustive checking
 * - Don't use if/else chains - use switch for better type inference
 * - Each type must be unique - duplicates break discriminated unions
 *
 * @example
 * function handleError(error: NavigationError) {
 *   switch (error.type) {
 *     case 'not-found':
 *       // error.path is string
 *       return show404(error.path);
 *     case 'loader-error':
 *       // error.error is Error, error.route is Route
 *       return showError(error.error, error.route);
 *     // ... TypeScript enforces handling all 7 cases
 *   }
 * }
 */
export type NavigationError =
  | { readonly type: 'not-found'; readonly path: string }
  | { readonly type: 'unauthorized'; readonly path: string; readonly route: Route }
  | { readonly type: 'guard-failed'; readonly path: string; readonly route: Route }
  | { readonly type: 'loader-error'; readonly error: Error; readonly route: Route }
  | { readonly type: 'component-error'; readonly error: Error; readonly route: Route }
  | { readonly type: 'navigation-aborted'; readonly path: string }
  | { readonly type: 'unknown'; readonly error: Error };
