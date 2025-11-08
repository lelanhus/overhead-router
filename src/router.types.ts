/**
 * Overhead Router: Type-safe, declarative routing for modern web apps
 * Designed for performance, simplicity, and semantic HTML
 */

/**
 * Extract parameter names from a path string
 * @example ExtractParams<'/users/:id/posts/:postId'> = { id: string; postId: string }
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
 */
export type RouterState =
  | { readonly status: 'idle' }
  | { readonly status: 'navigating'; readonly path: string }
  | { readonly status: 'matched'; readonly match: RouteMatch }
  | { readonly status: 'error'; readonly error: NavigationError };

/**
 * Navigation errors - discriminated union for type-safe error handling
 */
export type NavigationError =
  | { readonly type: 'not-found'; readonly path: string }
  | { readonly type: 'unauthorized'; readonly path: string; readonly route: Route }
  | { readonly type: 'guard-failed'; readonly path: string; readonly route: Route }
  | { readonly type: 'loader-error'; readonly error: Error; readonly route: Route }
  | { readonly type: 'component-error'; readonly error: Error; readonly route: Route }
  | { readonly type: 'navigation-aborted'; readonly path: string }
  | { readonly type: 'unknown'; readonly error: Error };
