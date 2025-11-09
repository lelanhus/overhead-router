/**
 * Example 13: Cache Strategies
 * Per-route caching configuration for optimal performance
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Advanced</span>
      </div>

      <h1 class="example-title">13. Cache Strategies</h1>
      <p class="example-description">
        Configure caching per-route to avoid unnecessary data fetching. Choose between
        params-only, query-aware, full URL, or no caching based on your needs.
      </p>

      <h2 class="section-heading">Cache Strategies</h2>
      <p>
        The router offers four caching strategies. Each balances freshness vs performance differently:
      </p>

      <ul>
        <li><strong>'params'</strong> (default) - Cache by path + params only (query/hash changes refetch)</li>
        <li><strong>'query'</strong> - Cache by path + params + query (hash changes refetch)</li>
        <li><strong>'full'</strong> - Cache by full URL including hash (maximum caching)</li>
        <li><strong>false</strong> - No caching (always fetch fresh data)</li>
      </ul>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  // Global cache configuration
  cache: {
    strategy: 'params',  // Default strategy
    maxSize: 10,         // LRU cache size
    maxAge: Infinity     // TTL in milliseconds
  },

  routes: [
    // Use default strategy
    route({
      path: '/users/:userId',
      loader: ({ params }) => fetchUser(params.userId)
    }),

    // Override: Cache includes query
    route({
      path: '/search',
      cache: { strategy: 'query', maxAge: 60000 },  // Cache for 1 minute
      loader: ({ query }) => search(query.get('q'))
    }),

    // Override: Full URL caching
    route({
      path: '/docs',
      cache: { strategy: 'full' },
      loader: ({ query, hash }) => fetchDocs(query, hash)
    }),

    // Override: No caching
    route({
      path: '/live-feed',
      cache: false,  // Always fetch fresh data
      loader: () => fetchLiveFeed()
    })
  ]
});
      `, 'cache-config.js')}\n
      <h2 class="section-heading">Strategy: 'params' (Default)</h2>
      <p>
        Caches by path and params. Query string and hash changes trigger refetch.
        Best for: User profiles, product pages, static content.
      </p>

      ${createCodeBlock(`
route({
  path: '/products/:productId',
  cache: { strategy: 'params' },  // Default
  loader: ({ params }) => fetchProduct(params.productId)
})

// Navigation behavior:
// /products/123          → Fetch, cache
// /products/123?sort=new → Fetch again (query changed)
// /products/123          → Use cache (same params)
// /products/456          → Fetch (different params)
      `, 'params-cache.js')}\n
      <h2 class="section-heading">Strategy: 'query'</h2>
      <p>
        Caches by path, params, and query. Hash changes trigger refetch.
        Best for: Search results, filtered lists, sorted data.
      </p>

      ${createCodeBlock(`
route({
  path: '/search',
  cache: { strategy: 'query', maxAge: 60000 },  // 1 minute TTL
  loader: ({ query }) => search(query.get('q'))
})

// Navigation behavior:
// /search?q=router              → Fetch, cache
// /search?q=router              → Use cache (same query)
// /search?q=router&filter=new   → Fetch again (query changed)
// /search?q=react               → Fetch (different query)
// /search?q=router#results      → Fetch (hash changed)
      `, 'query-cache.js')}\n
      <h2 class="section-heading">Strategy: 'full'</h2>
      <p>
        Caches by full URL including hash. Maximum caching, rare refetches.
        Best for: Documentation, static pages, rarely-changing content.
      </p>

      ${createCodeBlock(`
route({
  path: '/docs',
  cache: { strategy: 'full' },
  loader: ({ hash }) => fetchDocs(hash)
})

// Navigation behavior:
// /docs#intro            → Fetch, cache
// /docs#intro            → Use cache
// /docs#advanced         → Fetch (hash changed)
// /docs?version=2#intro  → Fetch (query changed)
      `, 'full-cache.js')}\n
      <h2 class="section-heading">Strategy: false (No Cache)</h2>
      <p>
        Never cache. Always fetch fresh data.
        Best for: Live feeds, real-time data, frequently changing content.
      </p>

      ${createCodeBlock(`
route({
  path: '/live-dashboard',
  cache: false,  // No caching
  loader: () => fetchLiveData()
})

// Navigation behavior:
// /live-dashboard   → Fetch
// /live-dashboard   → Fetch again (never cached)
      `, 'no-cache.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows different cache strategies in action. Watch the console to see
        when data is fetched vs loaded from cache.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Cache Control</h2>
      <p>
        You can manually clear the cache or check cache status:
      </p>

      ${createCodeBlock(`
// Clear all cached routes
router.clearCache();

// Force refresh on next navigation
router.navigate('/users/123', { skipCache: true });

// Check if route is cached
const match = router.getCurrentMatch();
console.log(match?.cached); // true if from cache
      `, 'cache-control.js')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Default to 'params'</strong> - Good balance for most routes</li>
        <li><strong>Use 'query' for search</strong> - Cache search results by query terms</li>
        <li><strong>Use 'full' sparingly</strong> - Only for truly static content</li>
        <li><strong>Disable for real-time</strong> - Set false for live data</li>
        <li><strong>Set maxAge wisely</strong> - Shorter TTL for frequently changing data</li>
        <li><strong>Monitor cache size</strong> - Adjust maxSize based on memory constraints</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered cache strategies for optimal performance! Next, we'll explore
        programmatic redirects from loaders for advanced navigation patterns.
      </p>

      <div class="navigation-controls">
        <a href="/examples/12-nested-routes" class="nav-button">← Previous: Nested Routes</a>
        <a href="/examples/14-programmatic-redirects" class="nav-button">Next: Programmatic Redirects →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Cache Strategies Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      let fetchCount = { params: 0, query: 0, full: 0, none: 0 };

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 260px;">
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
                <h2 style="margin: 0 0 16px 0;">Cache Strategy Comparison</h2>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                  Click routes multiple times to see caching behavior. Watch the fetch counters!
                </p>

                <div style="display: grid; gap: 12px; margin-bottom: 16px;">
                  <div style="padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                    <strong>Strategy: 'params'</strong> (${fetchCount.params} fetches)<br>
                    <a href="/params-demo/123" style="color: #000; text-decoration: underline;">→ View /params-demo/123</a><br>
                    <a href="/params-demo/123?query=test" style="color: #000; text-decoration: underline;">→ Add query param</a>
                  </div>

                  <div style="padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                    <strong>Strategy: 'query'</strong> (${fetchCount.query} fetches)<br>
                    <a href="/query-demo?q=test" style="color: #000; text-decoration: underline;">→ View /query-demo?q=test</a><br>
                    <a href="/query-demo?q=test#section" style="color: #000; text-decoration: underline;">→ Add hash</a>
                  </div>

                  <div style="padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                    <strong>Strategy: 'full'</strong> (${fetchCount.full} fetches)<br>
                    <a href="/full-demo#intro" style="color: #000; text-decoration: underline;">→ View /full-demo#intro</a><br>
                    <a href="/full-demo#advanced" style="color: #000; text-decoration: underline;">→ Change hash</a>
                  </div>

                  <div style="padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                    <strong>Strategy: false</strong> (no cache) (${fetchCount.none} fetches)<br>
                    <a href="/no-cache" style="color: #000; text-decoration: underline;">→ View /no-cache</a><br>
                    <a href="/no-cache" style="color: #000; text-decoration: underline;">→ Revisit (will refetch)</a>
                  </div>
                </div>
              `;
            }
          }),

          route({
            path: '/params-demo/:id',
            cache: { strategy: 'params' },
            loader: ({ params }) => {
              fetchCount.params++;
              logger.log(\`[params] Fetch #\${fetchCount.params} for ID: \${params.id}\`);
              return new Promise(resolve => setTimeout(() => resolve({ id: params.id }), 300));
            },
            component: (match) => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Params Cache Demo</h2>
                <p style="margin: 0 0 12px 0;">ID: ${match.data.id}</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ${match.cached ? '✓ Loaded from cache' : '⟳ Fresh fetch'}
                </div>
                <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
                  Total fetches: ${fetchCount.params}<br>
                  Query changes force refetch
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log(\`[params] Rendered (cached: \${match.cached || false})\`);
            }
          }),

          route({
            path: '/query-demo',
            cache: { strategy: 'query', maxAge: 30000 },
            loader: ({ query }) => {
              fetchCount.query++;
              logger.log(\`[query] Fetch #\${fetchCount.query} for q=\${query.get('q')}\`);
              return new Promise(resolve => setTimeout(() => resolve({ q: query.get('q') }), 300));
            },
            component: (match) => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Query Cache Demo</h2>
                <p style="margin: 0 0 12px 0;">Query: ${match.data.q}</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ${match.cached ? '✓ Loaded from cache' : '⟳ Fresh fetch'}
                </div>
                <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
                  Total fetches: ${fetchCount.query}<br>
                  Hash changes force refetch
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log(\`[query] Rendered (cached: \${match.cached || false})\`);
            }
          }),

          route({
            path: '/full-demo',
            cache: { strategy: 'full' },
            loader: ({ hash }) => {
              fetchCount.full++;
              logger.log(\`[full] Fetch #\${fetchCount.full} for hash: \${hash}\`);
              return new Promise(resolve => setTimeout(() => resolve({ hash: hash || 'none' }), 300));
            },
            component: (match) => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Full Cache Demo</h2>
                <p style="margin: 0 0 12px 0;">Hash: ${match.data.hash}</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ${match.cached ? '✓ Loaded from cache' : '⟳ Fresh fetch'}
                </div>
                <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
                  Total fetches: ${fetchCount.full}<br>
                  Full URL cached (including hash)
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log(\`[full] Rendered (cached: \${match.cached || false})\`);
            }
          }),

          route({
            path: '/no-cache',
            cache: false,
            loader: () => {
              fetchCount.none++;
              logger.log(\`[no-cache] Fetch #\${fetchCount.none} (always fetches)\`);
              return new Promise(resolve => setTimeout(() => resolve({ timestamp: Date.now() }), 300));
            },
            component: (match) => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">No Cache Demo</h2>
                <p style="margin: 0 0 12px 0;">Timestamp: ${match.data.timestamp}</p>
                <div style="padding: 12px; background: #fff3e0; margin-bottom: 12px; border: 1px solid #ff9800;">
                  ⟳ Always fetches fresh (never cached)
                </div>
                <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
                  Total fetches: ${fetchCount.none}<br>
                  Caching disabled
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log('[no-cache] Rendered (never cached)');
            }
          })
        ],

        cache: {
          strategy: 'params',
          maxSize: 10,
          maxAge: Infinity
        },

        ssr: true
      });

      logger.log('Router initialized with cache strategies');
      logger.log('Try revisiting routes to see caching in action');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
