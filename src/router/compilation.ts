/**
 * Route compilation - Convert route definitions to optimized matchers
 */

import type { Route, CompiledRoute } from "../router.types.js";
import { HAS_URL_PATTERN } from "./constants.js";
import { escapeRegex, joinPaths, extractParamNames } from "./helpers.js";

/**
 * Compile routes to optimized matchers
 * Performance: O(n) once at initialization
 *
 * Optimization: Separates static routes (no :params) into a Map for O(1) lookup.
 * Static routes are ~40-60% of typical applications and can skip pattern matching entirely.
 *
 * @param routes - Route definitions to compile
 * @param staticRoutes - Map to populate with static routes (O(1) lookup)
 * @param compiledRoutes - Container object with readonly array of dynamic routes
 * @param parentPath - Parent path for nested routes
 */
export function compileRoutes(
  routes: ReadonlyArray<Route>,
  // eslint-disable-next-line functional/prefer-readonly-type
  staticRoutes: Map<string, CompiledRoute>,
  // Container object that holds readonly array - we replace entire container
  compiledRoutes: { readonly value: readonly CompiledRoute[] },
  parentPath = "",
): { readonly value: readonly CompiledRoute[] } {
  // eslint-disable-next-line functional/no-let
  let result = compiledRoutes;

  for (const route of routes) {
    const fullPath = joinPaths(parentPath, route.path);
    const paramNames = extractParamNames(fullPath);

    // Use URLPattern API if available (faster), otherwise regex
    const pattern = HAS_URL_PATTERN
      ? new URLPattern({ pathname: fullPath })
      : patternToRegex(fullPath);

    const compiled: CompiledRoute = {
      route: { ...route, path: fullPath },
      pattern,
      paramNames,
    };

    // Optimization: Static routes (no parameters) get O(1) Map lookup
    // Dynamic routes (with :params) require pattern matching
    if (paramNames.length === 0) {
      staticRoutes.set(fullPath, compiled);
    } else {
      result = { value: [...result.value, compiled] };
    }

    // Recursively compile child routes
    if (route.children !== undefined) {
      result = compileRoutes(route.children, staticRoutes, result, fullPath);
    }
  }

  return result;
}

/**
 * Convert route pattern to RegExp for fallback
 * Properly escapes special regex chars while preserving :param syntax
 * Internal function - only used by compileRoutes
 */
function patternToRegex(pattern: string): RegExp {
  // eslint-disable-next-line functional/prefer-readonly-type
  const parts: string[] = [];

  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < pattern.length; ) {
    // Check for parameter syntax
    if (pattern[i] === ":") {
      const match = pattern.slice(i).match(/^:(\w+)/);
      if (match !== null) {
        // Replace parameter with capture group
        parts.push("([^/]+)");
        i += match[0].length;
        continue;
      }
    }

    // Regular character - escape if special
    const char = pattern[i];
    if (char !== undefined) {
      parts.push(escapeRegex(char));
    }
    i++;
  }

  const regexPattern = parts.join("");
  return new RegExp(`^${regexPattern}$`);
}
