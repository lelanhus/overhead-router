/**
 * Core route and router configuration types
 */

import type { NavigationError } from "./navigation.js";
import type { ExtractParams } from "./type-utils.js";

/**
 * Guard result types for declarative navigation control
 *
 * Guards can allow navigation, redirect, or deny access. When allowing navigation,
 * guards can optionally pass context data to the loader.
 *
 * DESIGN DECISION: Context Type Propagation
 * =========================================
 * The context field is typed as TContext but loaders receive it as unknown.
 * This is an intentional design trade-off:
 *
 * **Pros (Current Design):**
 * - Simple type system: Route has 3 generics (Path, TComponent, TData), not 4
 * - TypeScript can't infer TContext from inline guard functions anyway
 * - One `as` assertion is acceptable when guard/loader are co-located in same route
 * - Clear error messages and easier to understand
 *
 * **Cons (Current Design):**
 * - Requires manual type assertion in loaders: `const user = context as { user: User }`
 *
 * **Future Enhancement:**
 * Could add TContext generic to Route interface for full end-to-end type propagation,
 * but this adds significant complexity for marginal ergonomic gain. If users request
 * this feature, it can be added in a future version (backwards-compatible).
 *
 * @template TContext - Type of context passed to loader (defaults to unknown)
 *
 * @example
 * // Return types
 * return { allow: true, context: { user } };        // Allow with context
 * return { redirect: '/login', replace: true };     // Redirect
 * return { deny: true, reason: 'Not authorized' };  // Deny with reason
 * return true;                                       // Simple allow (backward compatible)
 *
 * @see {@link LoaderContext} for how loaders receive context
 */
export type GuardResult<TContext = unknown> =
  | { readonly allow: true; readonly context?: TContext }
  | { readonly redirect: string; readonly replace?: boolean }
  | { readonly deny: true; readonly reason?: string }
  | boolean; // Backward compatible: true = allow, false = deny

/**
 * Loader context passed to route loaders
 *
 * Provides access to params, query, hash, abort signal, and optional guard context.
 * All loaders receive this structured context object instead of individual parameters.
 *
 * **Type Safety Note:** The `context` field is typed as `unknown`, not the guard's `TContext`.
 * When using guard context in loaders, use a type assertion:
 *
 * @example
 * // Guard passes typed context
 * guard: async () => {
 *   const user = await getUser();
 *   return { allow: true, context: { user } };
 * },
 *
 * // Loader receives it and asserts type
 * loader: async ({ context }) => {
 *   const { user } = context as { user: User };
 *   return loadUserData(user);
 * }
 *
 * This is safe because guard and loader are defined together in the same route definition.
 * See {@link GuardResult} JSDoc for the design rationale behind this pattern.
 *
 * @template Path - URL path pattern for parameter extraction
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

  /** Optional context passed from guard (typed as unknown - use type assertion) */
  readonly context?: unknown;
}

/**
 * Cache strategy for route matching
 * - 'params': Cache by path params only (default, ignores query/hash changes)
 * - 'query': Cache by path + query (hash changes ignored)
 * - 'full': Cache by path + query + hash (all URL components)
 * - false: No caching, always re-match and re-load
 */
export type CacheStrategy = "params" | "query" | "full" | false;

/**
 * Cache configuration for routes
 */
export interface CacheConfig {
  /** Cache strategy (how to generate cache keys) */
  readonly strategy: CacheStrategy;
  /** Optional max age in milliseconds (Infinity = no expiry) */
  readonly maxAge?: number;
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
  TData = unknown,
> {
  /** URL path pattern with :param syntax */
  readonly path: Path;

  /** Lazy-loaded component/handler */
  readonly component: () => Promise<TComponent> | TComponent;

  /**
   * Optional route guard for access control
   * Can return:
   * - boolean: true = allow, false = deny
   * - { allow: true, context?: T }: allow with optional context for loader
   * - { redirect: string, replace?: boolean }: redirect to another path
   * - { deny: true, reason?: string }: deny with optional reason
   */
  readonly guard?: (
    params: ExtractParams<Path>,
  ) => GuardResult | Promise<GuardResult>;

  /** Optional data loader (called before rendering) */
  readonly loader?: (context: LoaderContext<Path>) => Promise<TData> | TData;

  /** Child routes for nesting */
  readonly children?: ReadonlyArray<Route>;

  /** Route metadata (for breadcrumbs, titles, etc.) */
  readonly meta?: Readonly<Record<string, unknown>>;

  /**
   * Cache configuration for this route
   * Overrides global cache config from RouterConfig
   * - 'params': Cache by path params only (query/hash changes trigger re-load)
   * - 'query': Cache by path + query (hash changes trigger re-load)
   * - 'full': Cache by everything (nothing triggers re-load)
   * - false: Never cache (always re-load)
   * - { strategy, maxAge }: Custom config with TTL
   */
  readonly cache?: CacheStrategy | CacheConfig;
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

  /**
   * Enable View Transitions API for smooth navigation animations (default: true)
   * Automatically detects browser support and falls back gracefully
   * Only available in Chrome 111+, Edge 111+, Safari 18+
   * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  readonly viewTransitions?: boolean;

  /**
   * Enable Navigation API for better SPA navigation control (default: false)
   * Experimental API with limited browser support
   * Only available in Chrome 102+, Edge 102+, Opera 88+
   * NOT supported in Safari or Firefox as of Nov 2025
   * Falls back to History API if unavailable
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
   */
  readonly useNavigationAPI?: boolean;

  /**
   * Global cache configuration (default: { strategy: 'params', maxSize: 10 })
   * Routes can override this with their own cache config
   */
  readonly cache?: {
    /** Default cache strategy for all routes */
    readonly strategy?: CacheStrategy;
    /** LRU cache size (default: 10) */
    readonly maxSize?: number;
    /** Default max age in milliseconds (default: Infinity) */
    readonly maxAge?: number;
  };
}
