/**
 * Route matching logic - Find and match routes against paths
 */

import type {
  Route,
  RouteMatch,
  CompiledRoute,
  ExtractParams,
  CacheStrategy,
} from "../router.types.js";
import type { LRUCache } from "./cache.js";
import { HAS_URL_PATTERN } from "./constants.js";

/**
 * Cached route match - only stores stable route data
 * Query and hash are ephemeral and always fetched fresh from window.location
 */
export type CachedRouteMatch = Pick<RouteMatch, "route" | "params" | "path">;

/**
 * URL components for route matching and caching
 */
export interface UrlComponents {
  readonly path: string;
  readonly query: URLSearchParams;
  readonly hash: string;
}

/**
 * Route matching context - groups routing dependencies
 */
export interface RouteMatchingContext {
  readonly staticRoutes: ReadonlyMap<string, CompiledRoute>;
  readonly compiledRoutes: readonly CompiledRoute[];
  readonly routeCache: LRUCache<string, CachedRouteMatch>;
  readonly globalStrategy: CacheStrategy;
  readonly globalMaxAge: number;
}

/**
 * Find matching compiled route for a given path
 * Extracted helper to avoid duplication between matchRoute() and match()
 *
 * Performance optimization: Checks static routes first (O(1) Map lookup),
 * then falls back to dynamic route pattern matching (O(n) loop).
 *
 * @param path - Clean pathname to match (no query/hash)
 * @param staticRoutes - Map of static routes for O(1) lookup
 * @param compiledRoutes - Array of dynamic routes for pattern matching
 * @returns Matched route with params, or null if no match
 */
export function findCompiledRoute(
  path: string,
  staticRoutes: ReadonlyMap<string, CompiledRoute>,
  compiledRoutes: readonly CompiledRoute[],
): { readonly route: Route; readonly params: ExtractParams<string> } | null {
  // Fast path: O(1) lookup for static routes (no :params)
  // Typical apps have 40-60% static routes (/about, /contact, /pricing, etc.)
  const staticMatch = staticRoutes.get(path);
  if (staticMatch !== undefined) {
    return {
      route: staticMatch.route,
      params: {} as ExtractParams<string>, // Static routes have no params
    };
  }

  // Slow path: O(n) pattern matching for dynamic routes (/users/:id, etc.)
  for (const compiled of compiledRoutes) {
    if (HAS_URL_PATTERN && compiled.pattern instanceof URLPattern) {
      // Use native URLPattern (faster)
      const match = compiled.pattern.exec({ pathname: path });
      if (match !== null) {
        return {
          route: compiled.route,
          params: (match.pathname.groups ?? {}) as ExtractParams<
            typeof compiled.route.path
          >,
        };
      }
    } else if (compiled.pattern instanceof RegExp) {
      // Fallback to regex
      const match = path.match(compiled.pattern);
      if (match !== null) {
        const params: Record<string, string> = {};
        compiled.paramNames.forEach((name, i) => {
          params[name] = match[i + 1] ?? "";
        });
        return {
          route: compiled.route,
          params: params as ExtractParams<typeof compiled.route.path>,
        };
      }
    }
  }
  return null;
}

/**
 * Generate cache key based on cache strategy
 * - 'params': path only (query/hash ignored)
 * - 'query': path + query string
 * - 'full': path + query + hash
 * - false: no caching
 */
export function getCacheKey(
  url: UrlComponents,
  route: Route,
  globalStrategy: CacheStrategy,
): string | null {
  // Determine cache strategy (route-specific overrides global)
  if (route.cache === false) {
    return null; // No caching for this route
  }

  const strategy: CacheStrategy =
    route.cache !== undefined
      ? typeof route.cache === "string"
        ? route.cache
        : route.cache.strategy
      : globalStrategy;

  // Generate key based on strategy
  switch (strategy) {
    case "params":
      return url.path; // Cache by path only
    case "query":
      return url.query.toString() === ""
        ? url.path
        : `${url.path}?${url.query.toString()}`; // Cache by path + query
    case "full":
      return url.query.toString() === ""
        ? url.hash === ""
          ? url.path
          : `${url.path}${url.hash}`
        : url.hash === ""
          ? `${url.path}?${url.query.toString()}`
          : `${url.path}?${url.query.toString()}${url.hash}`; // Cache by everything
    case false:
      return null; // No caching
    default:
      return url.path; // Fallback to params strategy
  }
}

/**
 * Get fresh query and hash from window.location (SSR-safe)
 */
function getFreshUrlComponents(): {
  readonly query: URLSearchParams;
  readonly hash: string;
} {
  const query = new URLSearchParams(
    typeof window !== "undefined" && window.location !== undefined
      ? window.location.search
      : "",
  );
  const hash =
    typeof window !== "undefined" && window.location !== undefined
      ? window.location.hash
      : "";
  return { query, hash };
}

/**
 * Determine cache strategy for a route
 */
function determineCacheStrategy(
  route: Route,
  globalStrategy: CacheStrategy,
): CacheStrategy {
  if (typeof route.cache === "string") {
    return route.cache;
  }
  if (typeof route.cache === "object") {
    return route.cache.strategy;
  }
  return globalStrategy;
}

/**
 * Handle cache hit - return cached match with fresh query/hash
 */
function handleCacheHit(
  cached: CachedRouteMatch,
  route: Route,
  urlComponents: { readonly query: URLSearchParams; readonly hash: string },
  globalStrategy: CacheStrategy,
): RouteMatch {
  const strategy = determineCacheStrategy(route, globalStrategy);

  if (strategy === "params") {
    return {
      ...cached,
      query: urlComponents.query,
      hash: urlComponents.hash,
      data: undefined, // Clear stale data on query/hash change
    };
  }

  // For 'query' and 'full', return cached with fresh query/hash
  return {
    ...cached,
    query: urlComponents.query,
    hash: urlComponents.hash,
  };
}

/**
 * Create and cache a new route match
 */
function createAndCacheMatch(
  found: { readonly route: Route; readonly params: ExtractParams<string> },
  matchData: {
    readonly path: string;
    readonly query: URLSearchParams;
    readonly hash: string;
    readonly cacheKey: string | null;
  },
  context: RouteMatchingContext,
): RouteMatch {
  const matchResult: RouteMatch = {
    route: found.route,
    params: found.params,
    query: matchData.query,
    hash: matchData.hash,
    path: matchData.path,
  } as RouteMatch;

  // Cache if enabled
  if (matchData.cacheKey !== null) {
    const cacheEntry: CachedRouteMatch = {
      route: matchResult.route,
      params: matchResult.params,
      path: matchResult.path,
    };

    const maxAge: number =
      typeof found.route.cache === "object" &&
      found.route.cache.maxAge !== undefined
        ? found.route.cache.maxAge
        : context.globalMaxAge;

    context.routeCache.set(matchData.cacheKey, cacheEntry, maxAge);
  }

  return matchResult;
}

/**
 * Match path against compiled routes with LRU caching
 * PERFORMANCE: O(1) cached, O(n) uncached. Always uses fresh query/hash from window.location
 * CACHE: Stores route+params+path only. Query/hash always fresh (change frequently)
 */
export function matchRoute(
  path: string,
  context: RouteMatchingContext,
): RouteMatch | null {
  // Get fresh query and hash from window.location
  const { query, hash } = getFreshUrlComponents();

  // Find matching route
  const found = findCompiledRoute(
    path,
    context.staticRoutes,
    context.compiledRoutes,
  );
  if (found === null) return null;

  // Generate cache key based on route's cache strategy
  const cacheKey = getCacheKey(
    { path, query, hash },
    found.route,
    context.globalStrategy,
  );

  // Check cache if enabled
  if (cacheKey !== null) {
    const cached = context.routeCache.get(cacheKey);
    if (cached !== undefined) {
      return handleCacheHit(
        cached,
        found.route,
        { query, hash },
        context.globalStrategy,
      );
    }
  }

  // Create and cache new match
  return createAndCacheMatch(found, { path, query, hash, cacheKey }, context);
}
