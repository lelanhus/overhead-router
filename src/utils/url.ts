/**
 * URL building utilities for type-safe path and query construction
 */

import type { ExtractParams } from "../router.types.js";

/**
 * Build a URL path from a route pattern and parameters
 *
 * Replaces parameter placeholders (e.g., :id) with actual values. TypeScript
 * ensures you provide all required parameters at compile-time.
 *
 * @param path - Route path pattern with parameter placeholders
 * @param params - Object containing parameter values (type-checked)
 * @returns Complete URL path with parameters replaced
 *
 * @example
 * buildPath('/products/:id', { id: '123' })
 * // Returns: '/products/123'
 *
 * @example
 * buildPath('/users/:userId/posts/:postId', { userId: 'john', postId: '42' })
 * // Returns: '/users/john/posts/42'
 *
 * @see {@link buildUrl} for including query parameters
 * @see {@link ExtractParams} for parameter type extraction
 */
export function buildPath<Path extends string>(
  path: Path,
  params: ExtractParams<Path>,
): string {
  // Replace :param with actual values using reduce
  return Object.entries(params).reduce(
    (result, [key, value]) =>
      result.replace(`:${key}`, encodeURIComponent(value)),
    path as string,
  );
}

/**
 * Build a URL query string from an object of parameters
 *
 * Converts an object to URL-encoded query string format. Undefined values
 * are automatically filtered out. Numbers and booleans are converted to strings.
 *
 * @param params - Object containing query parameters
 * @returns URL query string with leading '?' (empty string if no params)
 *
 * @example
 * buildQuery({ search: 'laptop', page: 2, featured: true })
 * // Returns: '?search=laptop&page=2&featured=true'
 *
 * @example
 * buildQuery({ search: 'laptop', category: undefined })
 * // Returns: '?search=laptop' (undefined values filtered)
 *
 * @example
 * buildQuery({})
 * // Returns: '' (empty string when no params)
 *
 * @see {@link buildUrl} for combining with path parameters
 */
export function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query !== "" ? `?${query}` : "";
}

/**
 * Build a complete URL with path parameters and query string
 *
 * Combines buildPath() and buildQuery() into a single function for convenience.
 * Ideal for creating navigation URLs with both path and query parameters.
 *
 * @param path - Route path pattern with parameter placeholders
 * @param params - Object containing path parameter values (type-checked)
 * @param query - Optional object containing query parameters
 * @returns Complete URL with path and query string
 *
 * @example
 * buildUrl('/products/:id', { id: '123' }, { view: 'details', lang: 'en' })
 * // Returns: '/products/123?view=details&lang=en'
 *
 * @example
 * buildUrl('/users/:userId', { userId: 'john' })
 * // Returns: '/users/john' (no query params)
 *
 * @see {@link buildPath} for path parameters only
 * @see {@link buildQuery} for query parameters only
 */
export function buildUrl<Path extends string>(
  path: Path,
  params: ExtractParams<Path>,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const url = buildPath(path, params);
  const queryString = query !== undefined ? buildQuery(query) : "";
  return url + queryString;
}
