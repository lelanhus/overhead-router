/**
 * Router initialization helpers
 */

import type {
  RouterConfig,
  CacheStrategy,
  NavigationError,
} from "../router.types.js";
import { escapeRegex } from "./helpers.js";

/**
 * Normalized router configuration with all defaults applied
 */
export interface NormalizedConfig {
  readonly routes: RouterConfig["routes"];
  readonly base: string;
  readonly notFound: () => void | Promise<void>;
  readonly unauthorized: () => void | Promise<void>;
  readonly onError: (error: NavigationError) => void;
  readonly hooks: {
    readonly beforeNavigate?: (path: string) => boolean | Promise<boolean>;
    readonly afterNavigate?: (path: string) => void | Promise<void>;
  };
  readonly ssr: boolean;
  readonly viewTransitions: boolean;
  readonly useNavigationAPI: boolean;
  readonly cache: {
    readonly strategy: CacheStrategy;
    readonly maxSize: number;
    readonly maxAge: number;
  };
}

/**
 * Default not found handler
 */
export function defaultNotFound(): void {
  if (typeof window !== "undefined" && window.location !== undefined) {
    console.warn("Route not found:", window.location.pathname);
  } else {
    console.warn("Route not found");
  }
}

/**
 * Default unauthorized handler
 */
export function defaultUnauthorized(): void {
  console.warn("Navigation blocked by route guard");
}

/**
 * Normalize cache configuration with defaults
 */
function normalizeCacheConfig(config: RouterConfig): {
  readonly strategy: CacheStrategy;
  readonly maxSize: number;
  readonly maxAge: number;
} {
  const size = config.cache?.maxSize ?? 10;
  const strategy = config.cache?.strategy ?? "params";
  const maxAge = config.cache?.maxAge ?? Infinity;

  return {
    strategy,
    maxSize: size,
    maxAge,
  };
}

/**
 * Normalize router configuration by applying defaults
 * @param config - User-provided router configuration
 * @returns Normalized configuration with all defaults applied
 */
export function normalizeConfig(config: RouterConfig): NormalizedConfig {
  const normalizedBase = config.base?.replace(/\/$/, "") ?? "";

  return {
    routes: config.routes,
    base: normalizedBase,
    notFound: config.notFound ?? defaultNotFound,
    unauthorized: config.unauthorized ?? defaultUnauthorized,
    onError: config.onError ?? console.error,
    hooks: config.hooks ?? {},
    ssr: config.ssr ?? false,
    viewTransitions: config.viewTransitions ?? true,
    useNavigationAPI: config.useNavigationAPI ?? false,
    cache: normalizeCacheConfig(config),
  };
}

/**
 * Create base path regex for stripping base from paths
 * @param basePath - Normalized base path
 * @returns Regex for matching and removing base path, or null if no base
 */
export function createBasePathRegex(basePath: string): RegExp | null {
  if (basePath === "") return null;

  // Cache base path regex with proper escaping and boundary enforcement
  // The (?=/|$) ensures we only match at segment boundaries:
  // - /app matches /app/page ✓
  // - /app does NOT match /application ✗
  return new RegExp(`^${escapeRegex(basePath)}(?=/|$)`);
}

/**
 * Extract pathname from a path that may include query string or hash
 * @param path - Full path that may include ?query or #hash
 * @returns Clean pathname without query or hash
 */
export function extractPathname(path: string): string {
  try {
    const url = new URL(path, "http://dummy.com");
    return url.pathname;
  } catch {
    // If URL parsing fails, extract pathname manually
    const queryIndex = path.indexOf("?");
    const hashIndex = path.indexOf("#");

    if (queryIndex !== -1) {
      return path.slice(0, queryIndex);
    } else if (hashIndex !== -1) {
      return path.slice(0, hashIndex);
    }
    return path;
  }
}
