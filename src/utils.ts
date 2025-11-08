/**
 * Utility functions for declarative, type-safe routing
 */

import type { Route, ExtractParams } from "./router.types.js";

/**
 * Type-safe link builder
 * Generates URLs with compile-time parameter checking
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
 * Type-safe query string builder
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
 * Combine path and query for type-safe navigation
 */
export function buildUrl<Path extends string>(
  path: Path,
  params: ExtractParams<Path>,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const builtPath = buildPath(path, params);
  const builtQuery = query !== undefined ? buildQuery(query) : "";
  return builtPath + builtQuery;
}

/**
 * Preload a route component (performance optimization)
 * Useful for prefetching on hover
 */
export async function preloadRoute(route: Route): Promise<void> {
  try {
    await route.component();
  } catch (error) {
    console.warn("Failed to preload route:", error);
  }
}

/**
 * Batch preload multiple routes (performance optimization)
 */
export async function preloadRoutes(routes: Route[]): Promise<void> {
  await Promise.all(routes.map(preloadRoute));
}

/**
 * Link prefetch helper for declarative preloading
 * Usage: <a href="/products/123" onmouseenter={prefetchOn}>
 */
export function createPrefetchHandler(router: {
  prefetch: (path: string) => Promise<void>;
}): (e: MouseEvent) => void {
  const prefetched = new Set<string>();

  return (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest("a[href]");
    if (target === null) return;

    const href = target.getAttribute("href");
    if (href === null || prefetched.has(href)) return;

    // Mark as prefetched
    prefetched.add(href);

    // Use public prefetch API
    void router.prefetch(href).catch(() => {
      // Remove from cache on failure
      prefetched.delete(href);
    });
  };
}

/**
 * Performance: Debounce function for scroll/resize handlers
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

/**
 * Performance: Measure route navigation time
 */
export interface PerformanceMetrics {
  matchTime: number;
  guardTime: number;
  loaderTime: number;
  componentTime: number;
  totalTime: number;
}

export class PerformanceMonitor {
  // Mutable for performance monitoring - rolling window of last 100 navigations
  private metrics: PerformanceMetrics[] = [];

  /**
   * Start tracking performance metrics for a navigation
   * @returns A PerformanceTracker instance to mark navigation milestones
   */
  startNavigation(): PerformanceTracker {
    return new PerformanceTracker();
  }

  /**
   * Record performance metrics for a completed navigation
   * Maintains a rolling window of the last 100 navigations
   * @param metrics - The performance metrics to record
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    // Keep last 100 navigations only - use immutable pattern
    this.metrics = [...this.metrics, metrics].slice(-100);
  }

  /**
   * Calculate average performance metrics across all recorded navigations
   * @returns Averaged metrics for match, guard, loader, component, and total time
   */
  getAverages(): PerformanceMetrics {
    const count = this.metrics.length;
    if (count === 0) {
      return {
        matchTime: 0,
        guardTime: 0,
        loaderTime: 0,
        componentTime: 0,
        totalTime: 0,
      };
    }

    return {
      matchTime: this.metrics.reduce((sum, m) => sum + m.matchTime, 0) / count,
      guardTime: this.metrics.reduce((sum, m) => sum + m.guardTime, 0) / count,
      loaderTime:
        this.metrics.reduce((sum, m) => sum + m.loaderTime, 0) / count,
      componentTime:
        this.metrics.reduce((sum, m) => sum + m.componentTime, 0) / count,
      totalTime: this.metrics.reduce((sum, m) => sum + m.totalTime, 0) / count,
    };
  }
}

class PerformanceTracker {
  private readonly startTime = performance.now();
  private marks: Record<string, number> = {};

  mark(label: string): void {
    this.marks[label] = performance.now();
  }

  finish(): PerformanceMetrics {
    const endTime = performance.now();

    return {
      matchTime:
        this.marks["matchEnd"] !== undefined
          ? this.marks["matchEnd"] - this.startTime
          : 0,
      guardTime:
        this.marks["guardEnd"] !== undefined
          ? this.marks["guardEnd"] - (this.marks["matchEnd"] ?? this.startTime)
          : 0,
      loaderTime:
        this.marks["loaderEnd"] !== undefined
          ? this.marks["loaderEnd"] - (this.marks["guardEnd"] ?? this.startTime)
          : 0,
      componentTime:
        this.marks["componentEnd"] !== undefined
          ? this.marks["componentEnd"] -
            (this.marks["loaderEnd"] ?? this.startTime)
          : 0,
      totalTime: endTime - this.startTime,
    };
  }
}

/**
 * Declarative scroll restoration
 */
export class ScrollRestoration {
  private readonly scrollPositions = new Map<string, number>();

  /**
   * Save the current scroll position for a given path
   * @param path - The path to associate with the current scroll position
   */
  save(path: string): void {
    this.scrollPositions.set(path, window.scrollY);
  }

  /**
   * Restore the saved scroll position for a given path
   * Scrolls to top if no position was previously saved
   * @param path - The path to restore scroll position for
   */
  restore(path: string): void {
    const position = this.scrollPositions.get(path) ?? 0;
    window.scrollTo({ top: position, behavior: "auto" });
  }

  /**
   * Clear all saved scroll positions
   */
  clear(): void {
    this.scrollPositions.clear();
  }
}

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

  // Check if starts with pattern
  if (!currentPath.startsWith(pattern)) return false;

  // Enforce segment boundary: character after pattern must be '/'
  // This prevents '/home' from matching '/homer'
  return currentPath[pattern.length] === "/";
}

/**
 * Active link helper for declarative CSS classes
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
  router?: { navigate: (path: string) => Promise<void> },
) {
  type RoutePaths = TRoutes[number]["path"];

  return {
    /**
     * Navigate to a route with type-safe parameters
     */
    navigate: <P extends RoutePaths>(
      path: P,
      params: ExtractParams<P>,
    ): Promise<void> => {
      if (router === undefined) {
        throw new Error("Router instance required for navigate()");
      }
      const url = buildPath(path, params);
      return router.navigate(url);
    },

    /**
     * Build a link URL for a route with type-safe parameters
     */
    link: <P extends RoutePaths>(path: P, params: ExtractParams<P>): string => {
      return buildPath(path, params);
    },

    /**
     * Build a link URL with query parameters
     */
    linkWithQuery: <P extends RoutePaths>(
      path: P,
      params: ExtractParams<P>,
      query?: Record<string, string | number | boolean | undefined>,
    ): string => {
      return buildUrl(path, params, query);
    },

    /**
     * Get all route paths (for iteration, validation, etc.)
     */
    get paths(): ReadonlyArray<RoutePaths> {
      return routes.map((r) => r.path) as ReadonlyArray<RoutePaths>;
    },

    /**
     * Check if a path exists in the routes
     */
    hasPath: (path: string): path is RoutePaths => {
      return routes.some((r) => r.path === path);
    },
  };
}

/**
 * Type-safe route helper with branded ValidPath
 * Validates that a path exists in the route configuration
 */
export function validatePath<const TRoutes extends ReadonlyArray<Route>>(
  routes: TRoutes,
  path: string,
): path is TRoutes[number]["path"] {
  return routes.some((r) => r.path === path);
}
