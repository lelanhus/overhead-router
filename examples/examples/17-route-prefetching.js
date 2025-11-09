/**
 * Example 17: Route Prefetching
 * Instant navigation with prefetch() for loading data ahead of time
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Expert</span>
      </div>

      <h1 class="example-title">17. Route Prefetching</h1>
      <p class="example-description">
        Prefetch routes before navigation to make page transitions instant. Load data
        on hover, on link visibility, or proactively based on user behavior.
      </p>

      <h2 class="section-heading">Why Prefetch?</h2>
      <p>
        Prefetching loads route data before the user navigates. When they click, the page
        appears instantly because the data is already cached.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/products/:id',
      loader: async ({ params }) => {
        const response = await fetch(\`/api/products/\${params.id}\`);
        return response.json();
      }
    })
  ]
});

// Prefetch on hover
document.querySelector('a[href="/products/123"]')
  .addEventListener('mouseenter', () => {
    router.prefetch('/products/123');
  });

// When user clicks, data is already loaded!
      `, 'prefetch-hover.js')}\n
      <h2 class="section-heading">Prefetch Strategies</h2>

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">1. Hover Prefetch</h3>
      <p>Load data when user hovers over a link (most common):</p>
      ${createCodeBlock(`
// Add to all navigation links
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('mouseenter', () => {
    const url = link.getAttribute('href');
    router.prefetch(url);
  });
});
      `, 'hover-prefetch.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">2. Intersection Observer</h3>
      <p>Prefetch when links become visible:</p>
      ${createCodeBlock(`
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const link = entry.target;
      const url = link.getAttribute('href');
      router.prefetch(url);
      observer.unobserve(link);  // Prefetch once
    }
  });
});

// Observe all product links
document.querySelectorAll('.product-link').forEach(link => {
  observer.observe(link);
});
      `, 'intersection-prefetch.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">3. Predictive Prefetch</h3>
      <p>Predict where users will go next:</p>
      ${createCodeBlock(`
// After user views a product, prefetch related products
route({
  path: '/products/:id',
  component: async (match) => {
    const product = match.data;

    // Prefetch related products
    product.relatedIds.forEach(id => {
      router.prefetch(\`/products/\${id}\`);
    });

    render(product);
  }
})
      `, 'predictive-prefetch.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">4. Idle Prefetch</h3>
      <p>Prefetch during browser idle time:</p>
      ${createCodeBlock(`
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Prefetch important routes during idle time
    router.prefetch('/dashboard');
    router.prefetch('/settings');
  });
}
      `, 'idle-prefetch.js')}\n
      <h2 class="section-heading">Automatic Hover Prefetch</h2>
      <p>
        Create a utility to automatically prefetch all links on hover:
      </p>

      ${createCodeBlock(`
function enablePrefetchOnHover(selector = 'a') {
  document.addEventListener('mouseover', (event) => {
    const link = event.target.closest(selector);

    if (link && link.href && !link.dataset.prefetched) {
      // Mark as prefetched to avoid duplicates
      link.dataset.prefetched = 'true';

      // Extract path from href
      const url = new URL(link.href, window.location.origin);

      // Only prefetch same-origin links
      if (url.origin === window.location.origin) {
        router.prefetch(url.pathname + url.search + url.hash);
      }
    }
  });
}

// Enable for all links
enablePrefetchOnHover();
      `, 'auto-prefetch.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows hover-based prefetching. Hover over links to prefetch data,
        then click to see instant navigation.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Prefetch Options</h2>
      <p>
        Control prefetch behavior with options:
      </p>

      ${createCodeBlock(`
// Basic prefetch
router.prefetch('/products/123');

// Skip cache (force fresh fetch)
router.prefetch('/products/123', { skipCache: true });

// Custom abort signal
const controller = new AbortController();
router.prefetch('/products/123', { signal: controller.signal });

// Cancel prefetch
controller.abort();
      `, 'prefetch-options.js')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Prefetch on hover</strong> - Gives ~300ms head start before click</li>
        <li><strong>Respect data limits</strong> - Consider user's connection (check navigator.connection)</li>
        <li><strong>Prioritize visible content</strong> - Prefetch above-the-fold links first</li>
        <li><strong>Avoid over-prefetching</strong> - Don't prefetch everything; be strategic</li>
        <li><strong>Mobile considerations</strong> - Hover doesn't exist on touch; use viewport instead</li>
        <li><strong>Cache-friendly</strong> - Prefetch respects cache settings</li>
      </ul>

      ${createCodeBlock(`
// Respect user preferences
if (navigator.connection?.saveData) {
  console.log('User has data saver enabled, skip prefetch');
} else {
  router.prefetch('/heavy-page');
}

// Avoid prefetching on slow connections
if (navigator.connection?.effectiveType === '4g') {
  enablePrefetchOnHover();
}
      `, 'data-saver.js')}\n
      <h2 class="section-heading">Performance Impact</h2>
      <p>
        Prefetching dramatically improves perceived performance:
      </p>
      <ul>
        <li><strong>Without prefetch</strong>: Click → 500ms fetch → Render (500ms delay)</li>
        <li><strong>With hover prefetch</strong>: Hover (300ms) → Click → Instant render (0ms delay)</li>
        <li><strong>Result</strong>: 500ms+ faster perceived navigation</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered route prefetching for instant navigation! Next, we'll explore
        active link styling to highlight the current page in navigation.
      </p>

      <div class="navigation-controls">
        <a href="/examples/16-breadcrumbs" class="nav-button">← Previous: Breadcrumbs</a>
        <a href="/examples/18-active-link-styling" class="nav-button">Next: Active Link Styling →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Route Prefetching Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      const products = {
        '1': { id: 1, name: 'Laptop Pro', price: 1299, delay: 1000 },
        '2': { id: 2, name: 'Wireless Mouse', price: 29, delay: 800 },
        '3': { id: 3, name: 'Keyboard', price: 89, delay: 1200 }
      };

      const prefetchedRoutes = new Set();

      function simulateFetch(id, delay) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(products[id]);
          }, delay);
        });
      }

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 220px;">
          <p style="color: #666;">Loading...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 16px 0;">Prefetch Demo</h2>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                  Hover over products to prefetch. Watch the console and timing!
                </p>
                <div style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; font-size: 12px;">
                  <strong>Prefetched:</strong> ${prefetchedRoutes.size} route${prefetchedRoutes.size !== 1 ? 's' : ''}<br>
                  ${Array.from(prefetchedRoutes).map(p => `✓ ${p}`).join('<br>') || 'None yet'}
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;" id="product-links">
                  ${Object.values(products).map(p => `
                    <a
                      href="/products/${p.id}"
                      data-product-id="${p.id}"
                      style="
                        padding: 12px;
                        border: 1px solid #ddd;
                        color: #000;
                        text-decoration: none;
                        background: white;
                      "
                    >
                      ${p.name} - $${p.price} (${p.delay}ms fetch)
                    </a>
                  `).join('')}
                </div>
              `;

              // Add hover prefetch listeners
              app.querySelectorAll('[data-product-id]').forEach(link => {
                link.addEventListener('mouseenter', () => {
                  const productId = link.dataset.productId;
                  const path = `/products/${productId}`;

                  if (!prefetchedRoutes.has(path)) {
                    logger.log(`🔄 Prefetching ${path}...`);
                    prefetchedRoutes.add(path);

                    // Simulate prefetch
                    simulateFetch(productId, products[productId].delay).then(() => {
                      logger.log(`✓ Prefetch complete: ${path}`);
                    });

                    // Update prefetch count
                    const prefetchInfo = app.querySelector('[style*="background: #f5f5f5"]');
                    if (prefetchInfo) {
                      prefetchInfo.innerHTML = `
                        <strong>Prefetched:</strong> ${prefetchedRoutes.size} route${prefetchedRoutes.size !== 1 ? 's' : ''}<br>
                        ${Array.from(prefetchedRoutes).map(p => `✓ ${p}`).join('<br>')}
                      `;
                    }
                  }
                });
              });
            }
          }),

          route({
            path: '/products/:id',
            loader: async ({ params }) => {
              const product = products[params.id];
              const startTime = Date.now();

              logger.log(`Loader started for product ${params.id}`);

              // Check if already prefetched (simulated)
              const wasPrefetched = prefetchedRoutes.has(`/products/${params.id}`);

              if (wasPrefetched) {
                logger.log(`⚡ Using prefetched data (instant!)`);
                return { ...product, loadTime: 0, prefetched: true };
              } else {
                const data = await simulateFetch(params.id, product.delay);
                const loadTime = Date.now() - startTime;
                logger.log(`📦 Fetched data in ${loadTime}ms`);
                return { ...data, loadTime, prefetched: false };
              }
            },
            component: (match) => {
              const product = match.data;

              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">${product.name}</h2>
                <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold;">$${product.price}</p>
                <div style="padding: 12px; background: ${product.prefetched ? '#e8f5e9' : '#fff3e0'}; margin-bottom: 16px; border: 1px solid ${product.prefetched ? '#4caf50' : '#ff9800'};">
                  ${product.prefetched
                    ? `⚡ <strong>Instant load!</strong> (prefetched)<br>Load time: ${product.loadTime}ms`
                    : `⏱️ <strong>Regular load</strong> (not prefetched)<br>Load time: ${product.loadTime}ms`
                  }
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Products</a>
              `;

              logger.log(`Rendered product: ${product.name} (prefetched: ${product.prefetched})`);
            }
          })
        ],

        ssr: true
      });

      logger.log('Router initialized with prefetch support');
      logger.log('Hover over products to see prefetch in action');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
