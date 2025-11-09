/**
 * Helper utilities for the router
 * Pure functions with no external dependencies
 */

/**
 * Escape special regex characters
 * Performance: Single regex pass to escape all special chars
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Join path segments
 * Performance: Single regex pass instead of two
 */
export function joinPaths(...paths: readonly string[]): string {
  const joined = paths.filter(Boolean).join("/");
  if (joined === "") return "/";

  // Single regex: normalize multiple slashes and remove trailing slash
  const normalized = joined.replace(/\/+/g, "/").replace(/\/$/, "");
  return normalized !== "" ? normalized : "/";
}

/**
 * Extract parameter names from pattern
 */
export function extractParamNames(pattern: string): readonly string[] {
  const matches = pattern.matchAll(/:(\w+)/g);
  return Array.from(matches, (m) => m[1] ?? "");
}
