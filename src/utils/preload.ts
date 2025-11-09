/**
 * Route preloading and prefetching utilities
 */

import type { Route } from "../router.types.js";

/**
 * Preload a route's component for instant navigation
 *
 * Loads a route's component in advance to make future navigation feel instant.
 * Useful for critical routes or hover-triggered prefetching. Errors are logged
 * but don't throw to prevent disruption.
 *
 * @param route - Route definition to preload
 * @returns Promise that resolves when component is loaded (or fails silently)
 *
 * @example
 * // Preload critical routes on page load
 * window.addEventListener('load', async () => {
 *   await preloadRoute(homeRoute);
 *   await preloadRoute(productsRoute);
 * });
 *
 * @example
 * // Prefetch on hover
 * link.addEventListener('mouseenter', () => {
 *   preloadRoute(productRoute);
 * });
 *
 * @see {@link preloadRoutes} for batch preloading
 * @see {@link createPrefetchHandler} for automatic hover-triggered prefetching
 */
export async function preloadRoute(route: Route): Promise<void> {
  try {
    await route.component();
  } catch (error) {
    console.warn("Failed to preload route:", error);
  }
}

/**
 * Preload multiple routes in parallel for performance optimization
 *
 * Loads all route components simultaneously using Promise.all for maximum speed.
 * Ideal for preloading critical routes during application initialization.
 *
 * @param routes - Array of routes to preload
 * @returns Promise that resolves when all routes are loaded
 *
 * @example
 * // Preload critical routes after app loads
 * const criticalRoutes = [homeRoute, productsRoute, aboutRoute];
 * await preloadRoutes(criticalRoutes);
 *
 * @see {@link preloadRoute} for single route preloading
 */
export async function preloadRoutes(routes: readonly Route[]): Promise<void> {
  await Promise.all(routes.map(preloadRoute));
}

/**
 * Create a hover-triggered prefetch handler for instant navigation
 *
 * Returns an event handler that prefetches routes when users hover over links.
 * Uses a Set to track prefetched routes and prevent duplicate fetches. The average
 * hover-to-click time (~300-500ms) is enough to load most route components.
 *
 * @param router - Router instance with prefetch method
 * @returns Event handler function for mouseenter events
 *
 * @example
 * // Global hover prefetching
 * const prefetchHandler = createPrefetchHandler(router);
 * document.addEventListener('mouseenter', prefetchHandler, true);
 *
 * @example
 * // Scoped to navigation
 * const nav = document.querySelector('nav');
 * nav.addEventListener('mouseenter', createPrefetchHandler(router), true);
 *
 * @see {@link preloadRoute} for manual preloading
 */
export function createPrefetchHandler(router: {
  readonly prefetch: (path: string) => Promise<void>;
}): (e: MouseEvent) => void {
  const prefetched = new Set<string>();

  return (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest("a[href]");
    if (target === null) return;

    const href = target.getAttribute("href");
    if (href === null) return;

    // Normalize to pathname only (strip query and hash) for de-duplication
    // This prevents redundant prefetches for /page?a=1 and /page?b=2
    const pathname = (() => {
      try {
        return new URL(href, window.location.href).pathname;
      } catch {
        // Fallback for invalid URLs: strip query/hash manually
        const queryIndex = href.indexOf("?");
        const hashIndex = href.indexOf("#");
        if (queryIndex !== -1) return href.slice(0, queryIndex);
        if (hashIndex !== -1) return href.slice(0, hashIndex);
        return href;
      }
    })();

    if (prefetched.has(pathname)) return;

    // Mark as prefetched (by pathname, not full href)
    prefetched.add(pathname);

    // Use public prefetch API
    void router.prefetch(href).catch(() => {
      // Remove from cache on failure
      prefetched.delete(pathname);
    });
  };
}
