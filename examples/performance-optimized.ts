/**
 * Example: Performance-optimized declarative routing
 * Shows how declarative configuration enables automatic optimizations
 */

import { createRouter, route } from '../src/router';
import {
  buildUrl,
  preloadRoutes,
  createPrefetchHandler,
  PerformanceMonitor,
  ScrollRestoration,
  getActiveClass,
} from '../src/utils';

/**
 * Performance monitor - track navigation metrics
 */
const perfMonitor = new PerformanceMonitor();

/**
 * Scroll restoration - remember scroll positions
 */
const scrollRestoration = new ScrollRestoration();

/**
 * Declarative routes with performance optimizations
 */
const router = createRouter({
  routes: [
    route('/', {
      component: () => import('./pages/home'),
    }),

    route('/products', {
      component: () => import('./pages/products'),
      // Loader runs in parallel with component loading!
      loader: async () => {
        const res = await fetch('/api/products');
        return res.json();
      },
    }),

    route('/products/:id', {
      // Lazy loading - only loads when needed
      component: () => import('./pages/product-detail'),
      loader: async ({ params, signal }) => {
        // Params are type-safe
        const res = await fetch(`/api/products/${params.id}`, { signal });
        return res.json();
      },
    }),
  ],

  hooks: {
    beforeNavigate: async (path) => {
      // Save scroll position for current page
      const currentMatch = router.getCurrentMatch();
      if (currentMatch) {
        scrollRestoration.save(currentMatch.path);
      }

      // Track performance
      const tracker = perfMonitor.startNavigation();
      (window as any).__perfTracker = tracker;

      return true;
    },

    afterNavigate: async (path) => {
      // Record performance metrics
      const tracker = (window as any).__perfTracker;
      if (tracker) {
        const metrics = tracker.finish();
        perfMonitor.recordMetrics(metrics);

        // Log slow navigations
        if (metrics.totalTime > 1000) {
          console.warn('Slow navigation detected:', metrics);
        }
      }

      // Restore scroll position for back/forward navigation
      if ((window as any).__isBackForward) {
        scrollRestoration.restore(path);
      }
    },
  },
});

/**
 * Detect back/forward navigation
 */
window.addEventListener('popstate', () => {
  (window as any).__isBackForward = true;
  setTimeout(() => {
    (window as any).__isBackForward = false;
  }, 100);
});

/**
 * Preload critical routes on app load
 * Performance: Reduces navigation time for common routes
 */
async function preloadCriticalRoutes() {
  // Preload routes user is likely to visit
  const criticalRoutes = router['compiledRoutes']
    .map((c) => c.route)
    .filter((r) => ['/', '/products'].includes(r.path));

  await preloadRoutes(criticalRoutes);
  console.log('Critical routes preloaded');
}

// Preload after initial page load
if (document.readyState === 'complete') {
  preloadCriticalRoutes();
} else {
  window.addEventListener('load', preloadCriticalRoutes);
}

/**
 * Prefetch on hover - declarative performance optimization
 * Performance: Routes load instantly when clicked
 */
const prefetchHandler = createPrefetchHandler(router);

document.addEventListener('mouseenter', prefetchHandler, true);

/**
 * Example: Type-safe navigation with query params
 */
async function navigateToProductsFiltered() {
  const url = buildUrl(
    '/products',
    {}, // No path params
    { category: 'electronics', sort: 'price', limit: 20 } // Query params
  );

  await router.navigate(url);
  // Navigates to: /products?category=electronics&sort=price&limit=20
}

/**
 * Example: Type-safe navigation with path params
 */
async function navigateToProduct(productId: string) {
  const url = buildUrl('/products/:id', { id: productId });
  await router.navigate(url);
  // Navigates to: /products/123
}

/**
 * Example: Declarative active link styling
 * Performance: No React re-renders, pure function
 */
function NavLink({ href, label }: { href: string; label: string }) {
  const currentPath = router.getCurrentMatch()?.path ?? '/';
  const className = getActiveClass(currentPath, href);

  return `<a href="${href}" class="${className}">${label}</a>`;
}

/**
 * Example: Update active links on navigation (vanilla JS)
 */
router.subscribe((match) => {
  if (!match) return;

  // Update all nav links
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href) {
      const isActive = getActiveClass(match.path, href);
      link.classList.toggle('active', Boolean(isActive));
    }
  });
});

/**
 * Performance dashboard - view routing metrics
 */
function showPerformanceMetrics() {
  const averages = perfMonitor.getAverages();

  console.table({
    'Route Matching': `${averages.matchTime.toFixed(2)}ms`,
    'Guard Execution': `${averages.guardTime.toFixed(2)}ms`,
    'Data Loading': `${averages.loaderTime.toFixed(2)}ms`,
    'Component Loading': `${averages.componentTime.toFixed(2)}ms`,
    'Total Navigation': `${averages.totalTime.toFixed(2)}ms`,
  });
}

// Expose for debugging
(window as any).showPerformanceMetrics = showPerformanceMetrics;

/**
 * Performance: Efficient re-rendering
 * Subscribe to specific route changes only
 */
router.subscribe((match) => {
  // Only re-render when route actually changes
  if (match?.route.path === '/products') {
    // Render products page
    console.log('Rendering products page');
  }
});

/**
 * Example: Semantic HTML with automatic route prefetch
 */
const semanticHTML = `
  <nav>
    <!-- Links are automatically intercepted -->
    <!-- Hover to prefetch, click to navigate instantly -->
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/about">About</a>
  </nav>

  <main>
    <h1>Welcome</h1>

    <!-- Type-safe link building in templates -->
    <a href="${buildUrl('/products/:id', { id: '123' })}">
      Product 123
    </a>

    <!-- External links work normally -->
    <a href="https://example.com" data-external>
      External Link
    </a>
  </main>
`;

export { router, navigateToProduct, navigateToProductsFiltered, showPerformanceMetrics };
