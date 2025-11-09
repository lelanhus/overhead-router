/**
 * Router utility methods for matching and prefetching
 */

import type { RouteMatch, CompiledRoute } from "../router.types.js";
import { extractPathname } from "./initialization.js";
import { findCompiledRoute } from "./matching.js";

/**
 * Match a path without touching window.location
 * Useful for SSR, testing, and programmatic route matching
 *
 * @param path - Path to match
 * @param staticRoutes - Map of static routes
 * @param compiledRoutes - Array of dynamic routes
 * @param options - Optional query and hash parameters
 * @returns Route match or null if not found
 */
export function matchPath(
  path: string,
  staticRoutes: ReadonlyMap<string, CompiledRoute>,
  compiledRoutes: readonly CompiledRoute[],
  options?: { readonly search?: string; readonly hash?: string },
): RouteMatch | null {
  const found = findCompiledRoute(path, staticRoutes, compiledRoutes);
  if (found === null) return null;

  const query = new URLSearchParams(options?.search ?? "");
  const hash = options?.hash ?? "";

  return {
    route: found.route,
    params: found.params,
    query,
    hash,
    path,
  } as RouteMatch;
}

/**
 * Prefetch a route by path (preloads component for performance)
 *
 * @param path - Path to prefetch
 * @param matchFn - Function to match the path and get route
 * @returns Promise that resolves when component is loaded
 */
export async function prefetchRoute(
  path: string,
  matchFn: (pathname: string) => RouteMatch | null,
): Promise<void> {
  const pathname = extractPathname(path);
  const match = matchFn(pathname);

  if (match !== null && match.route.component !== undefined) {
    try {
      await match.route.component();
    } catch (error) {
      console.warn("Failed to prefetch route:", path, error);
    }
  }
}
