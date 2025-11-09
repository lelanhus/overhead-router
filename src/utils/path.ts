/**
 * Path matching and validation utilities
 */

import type { Route, ExtractParams } from "../router.types.js";
import { buildPath, buildUrl } from "./url.js";

/**
 * Check if a path matches a pattern with segment boundary enforcement
 * @param currentPath - Current path to check
 * @param pattern - Pattern to match against
 * @param exact - Whether to require exact match (default: false = prefix match)
 *
 * Prefix matching enforces segment boundaries to prevent false positives:
 * - pathMatches('/home/about', '/home') → true ✓
 * - pathMatches('/homer', '/home') → false ✓ (boundary check prevents match)
 */
export function pathMatches(
  currentPath: string,
  pattern: string,
  exact = false,
): boolean {
  if (exact) {
    return currentPath === pattern;
  }

  // Exact match at any point
  if (currentPath === pattern) return true;

  // Special case: root path "/" matches all paths in prefix mode
  if (pattern === "/") return true;

  // Check if starts with pattern
  if (!currentPath.startsWith(pattern)) return false;

  // Enforce segment boundary: character after pattern must be '/'
  // This prevents '/home' from matching '/homer'
  // Defensive check: ensure we don't access beyond string length
  return (
    currentPath.length > pattern.length && currentPath[pattern.length] === "/"
  );
}

/**
 * Get CSS class for active navigation links
 *
 * Returns the active class when the current path matches the link path, useful
 * for highlighting the current page in navigation menus. Supports both exact
 * and prefix matching with segment boundary enforcement.
 *
 * @param currentPath - Current browser path
 * @param linkPath - Link path to check against
 * @param activeClass - CSS class to return when active (default: 'active')
 * @param exact - Require exact match vs prefix match (default: false)
 * @returns Active class string if matched, empty string otherwise
 *
 * @example
 * // Prefix matching (default)
 * getActiveClass('/products/123', '/products') // 'active'
 * getActiveClass('/about', '/products')        // ''
 *
 * @example
 * // Exact matching
 * getActiveClass('/products', '/products', 'active', true)     // 'active'
 * getActiveClass('/products/123', '/products', 'active', true) // ''
 *
 * @example
 * // Custom active class
 * getActiveClass('/home', '/home', 'nav-active') // 'nav-active'
 *
 * @see {@link pathMatches} for the underlying matching logic
 */
export function getActiveClass(
  currentPath: string,
  linkPath: string,
  activeClass = "active",
  exact = false,
): string {
  return pathMatches(currentPath, linkPath, exact) ? activeClass : "";
}

/**
 * Type-safe route builder
 * Creates a builder object with type-safe navigation helpers for each route
 *
 * @example
 * const routes = [
 *   route('/products/:id', { component: () => import('./product') }),
 *   route('/users/:userId/posts/:postId', { component: () => import('./post') })
 * ] as const;
 *
 * const builder = createRouteBuilder(routes, router);
 *
 * // Type-safe navigation with autocomplete
 * builder.navigate('/products/:id', { id: '123' });
 * builder.link('/users/:userId/posts/:postId', { userId: 'john', postId: '42' });
 */
export function createRouteBuilder<const TRoutes extends ReadonlyArray<Route>>(
  routes: TRoutes,
  router?: { readonly navigate: (path: string) => Promise<void> },
) {
  type RoutePaths = TRoutes[number]["path"];

  return {
    navigate: <P extends RoutePaths>(
      path: P,
      params: ExtractParams<P>,
    ): Promise<void> => {
      if (router === undefined) {
        throw new Error("Router instance required for navigate()");
      }
      return router.navigate(buildPath(path, params));
    },

    link: <P extends RoutePaths>(path: P, params: ExtractParams<P>): string =>
      buildPath(path, params),

    linkWithQuery: <P extends RoutePaths>(
      path: P,
      params: ExtractParams<P>,
      query?: Record<string, string | number | boolean | undefined>,
    ): string => buildUrl(path, params, query),

    get paths(): ReadonlyArray<RoutePaths> {
      return routes.map((r) => r.path) as ReadonlyArray<RoutePaths>;
    },

    hasPath: (path: string): path is RoutePaths =>
      routes.some((r) => r.path === path),
  };
}

/**
 * Validate that a path exists in the route configuration
 *
 * Type guard that checks if a path string matches any route in the configuration.
 * TypeScript narrows the type to a valid route path when this returns true.
 *
 * @param routes - Array of route definitions
 * @param path - Path string to validate
 * @returns True if path exists in routes, false otherwise (with type narrowing)
 *
 * @example
 * const routes = [
 *   route({ path: '/', component: () => import('./home') }),
 *   route({ path: '/products/:id', component: () => import('./product') })
 * ] as const;
 *
 * if (validatePath(routes, userInput)) {
 *   // TypeScript knows userInput is '/' | '/products/:id'
 *   router.navigate(userInput);
 * }
 *
 * @see {@link createRouteBuilder} for a more powerful type-safe routing API
 */
export function validatePath<const TRoutes extends ReadonlyArray<Route>>(
  routes: TRoutes,
  path: string,
): path is TRoutes[number]["path"] {
  return routes.some((r) => r.path === path);
}
