/**
 * Breadcrumb generation utilities
 */

import type { RouteMatch, CompiledRoute } from "../router.types.js";
import { HAS_URL_PATTERN } from "./constants.js";

/**
 * Generate breadcrumbs for a route match
 * Looks up intermediate routes for proper titles
 *
 * @param match - Current route match
 * @param staticRoutes - Map of static routes for O(1) lookup
 * @param compiledRoutes - Array of dynamic routes for pattern matching
 * @returns Array of breadcrumb objects with path and title
 */
export function generateBreadcrumbs(
  match: RouteMatch | null,
  staticRoutes: ReadonlyMap<string, CompiledRoute>,
  compiledRoutes: readonly CompiledRoute[],
): ReadonlyArray<{ readonly path: string; readonly title: string }> {
  if (match === null) return [];

  const pathSegments = match.path.split("/").filter(Boolean);

  return pathSegments
    .map((segment, i) => {
      const currentPath = `/${pathSegments.slice(0, i + 1).join("/")}`;

      const staticRoute = staticRoutes.get(currentPath);
      const matchingRoute =
        staticRoute ??
        compiledRoutes.find((r) => {
          if (r.route.path === currentPath) return true;

          if (HAS_URL_PATTERN && r.pattern instanceof URLPattern) {
            return r.pattern.test({ pathname: currentPath });
          } else if (r.pattern instanceof RegExp) {
            return r.pattern.test(currentPath);
          }
          return false;
        });

      const matchingTitle = matchingRoute?.route.meta?.["title"];
      const matchTitle = match.route.meta?.["title"];
      const title =
        matchingTitle !== undefined &&
        (typeof matchingTitle === "string" || typeof matchingTitle === "number")
          ? String(matchingTitle)
          : i === pathSegments.length - 1 &&
              matchTitle !== undefined &&
              (typeof matchTitle === "string" || typeof matchTitle === "number")
            ? String(matchTitle)
            : segment;

      return { path: currentPath, title };
    })
    .filter((crumb) => crumb !== undefined);
}
