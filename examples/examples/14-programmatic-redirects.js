/**
 * Example 14: Programmatic Redirects
 * Redirect from loaders based on data or conditions
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Advanced</span>
      </div>

      <h1 class="example-title">14. Programmatic Redirects</h1>
      <p class="example-description">
        Loaders can trigger redirects based on data. Perfect for handling legacy URLs,
        short links, or redirecting based on fetched data.
      </p>

      <h2 class="section-heading">Redirecting from Loaders</h2>
      <p>
        Throw a redirect error from your loader to navigate to a different route:
      </p>

      ${createCodeBlock(`
import { createRouter, route, redirect } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/old-product/:id',
      loader: async ({ params }) => {
        // Fetch new URL from migration mapping
        const response = await fetch(\`/api/migrate/\${params.id}\`);
        const { newUrl } = await response.json();

        // Redirect to new URL
        throw redirect(newUrl);
      }
    }),

    route({
      path: '/products/:id',
      loader: async ({ params }) => {
        const response = await fetch(\`/api/products/\${params.id}\`);
        return response.json();
      },
      component: (match) => {
        render(\`<h1>\${match.data.name}</h1>\`);
      }
    })
  ]
});
      `, 'redirect-loader.js')}\n
      <h2 class="section-heading">Redirect Options</h2>
      <p>
        The <code>redirect()</code> function accepts a URL and optional configuration:
      </p>

      ${createCodeBlock(`
// Simple redirect
throw redirect('/new-path');

// Replace history entry (back button won't return to this page)
throw redirect('/new-path', { replace: true });

// Redirect with full URL
throw redirect('https://example.com/page');

// Conditional redirect
route({
  path: '/dashboard',
  loader: async () => {
    const user = await fetchUser();

    if (!user.onboarded) {
      throw redirect('/onboarding', { replace: true });
    }

    return user;
  }
})
      `, 'redirect-options.js')}\n
      <h2 class="section-heading">Common Redirect Patterns</h2>

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">URL Migration</h3>
      ${createCodeBlock(`
// Redirect old URLs to new structure
route({
  path: '/blog/:year/:month/:slug',
  loader: ({ params }) => {
    // New structure: /posts/:slug
    throw redirect(\`/posts/\${params.slug}\`);
  }
})
      `, 'migration.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Short Links</h3>
      ${createCodeBlock(`
route({
  path: '/s/:shortId',
  loader: async ({ params }) => {
    const response = await fetch(\`/api/short-links/\${params.shortId}\`);
    const { destination } = await response.json();
    throw redirect(destination);
  }
})
      `, 'short-links.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Conditional Navigation</h3>
      ${createCodeBlock(`
route({
  path: '/checkout',
  loader: async () => {
    const cart = await fetchCart();

    // Redirect if cart is empty
    if (cart.items.length === 0) {
      throw redirect('/shop', { replace: true });
    }

    return cart;
  }
})
      `, 'conditional.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Smart Redirects</h3>
      ${createCodeBlock(`
route({
  path: '/profile',
  loader: async () => {
    const user = await fetchCurrentUser();

    // First-time users go to onboarding
    if (!user.profileComplete) {
      throw redirect('/onboarding/welcome');
    }

    // Suspended users see warning
    if (user.status === 'suspended') {
      throw redirect('/account/suspended');
    }

    return user;
  }
})
      `, 'smart-redirect.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows various redirect scenarios. Click the links to see loaders
        redirect based on different conditions.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Redirect vs Guard Redirect</h2>
      <p>
        Both guards and loaders can redirect, but they serve different purposes:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="text-align: left; padding: 8px;">Feature</th>
            <th style="text-align: left; padding: 8px;">Guard Redirect</th>
            <th style="text-align: left; padding: 8px;">Loader Redirect</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>When</strong></td>
            <td style="padding: 8px;">Before data fetch</td>
            <td style="padding: 8px;">After data fetch</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Use for</strong></td>
            <td style="padding: 8px;">Auth, permissions</td>
            <td style="padding: 8px;">Data-based logic</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Performance</strong></td>
            <td style="padding: 8px;">Faster (no fetch)</td>
            <td style="padding: 8px;">Slower (fetch first)</td>
          </tr>
        </tbody>
      </table>

      <h2 class="section-heading">Error Handling</h2>
      <p>
        If a redirect fails (e.g., invalid URL), the error propagates to your component:
      </p>

      ${createCodeBlock(`
route({
  path: '/redirect-test',
  loader: () => {
    try {
      throw redirect('/destination');
    } catch (error) {
      // Redirect errors are special - let them propagate
      if (error.type === 'redirect') {
        throw error;
      }
      // Handle other errors
      console.error('Loader failed:', error);
    }
  }
})
      `, 'error-handling.js')}\n
      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've learned programmatic redirects for dynamic navigation! Next, we'll explore
        route subscriptions for reacting to navigation events.
      </p>

      <div class="navigation-controls">
        <a href="/examples/13-cache-strategies" class="nav-button">← Previous: Cache Strategies</a>
        <a href="/examples/15-route-subscriptions" class="nav-button">Next: Route Subscriptions →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Programmatic Redirects Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Simulate URL mappings
      const urlMigrations = {
        'old-123': '/products/laptop-pro',
        'old-456': '/products/mouse-wireless',
        'old-789': '/products/keyboard-mech'
      };

      const shortLinks = {
        'promo': '/products/laptop-pro?discount=20',
        'deal': '/products/mouse-wireless?sale=true'
      };

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 200px;">
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
                <h2 style="margin: 0 0 16px 0;">Redirect Scenarios</h2>

                <h3 style="font-size: 14px; margin: 0 0 8px 0;">URL Migration</h3>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                  Old URLs redirect to new structure
                </p>
                <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px;">
                  <a href="/old/old-123" style="color: #000; text-decoration: underline; font-size: 13px;">
                    → /old/old-123 (redirects to /products/laptop-pro)
                  </a>
                  <a href="/old/old-456" style="color: #000; text-decoration: underline; font-size: 13px;">
                    → /old/old-456 (redirects to /products/mouse-wireless)
                  </a>
                </div>

                <h3 style="font-size: 14px; margin: 0 0 8px 0;">Short Links</h3>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                  Short IDs expand to full URLs
                </p>
                <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px;">
                  <a href="/s/promo" style="color: #000; text-decoration: underline; font-size: 13px;">
                    → /s/promo (redirects to product with discount)
                  </a>
                  <a href="/s/deal" style="color: #000; text-decoration: underline; font-size: 13px;">
                    → /s/deal (redirects to sale item)
                  </a>
                </div>

                <h3 style="font-size: 14px; margin: 0 0 8px 0;">Conditional Redirect</h3>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                  Redirect based on data/conditions
                </p>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <a href="/empty-cart-checkout" style="color: #000; text-decoration: underline; font-size: 13px;">
                    → Checkout with empty cart (redirects to shop)
                  </a>
                </div>
              `;
            }
          }),

          // Old URL pattern - redirects to new
          route({
            path: '/old/:oldId',
            loader: ({ params }) => {
              const newPath = urlMigrations[params.oldId];

              if (!newPath) {
                logger.log(`❌ No migration found for ${params.oldId}`);
                throw new Error('Page not found');
              }

              logger.log(`🔀 Redirecting /old/${params.oldId} → ${newPath}`);

              // Simulate redirect (router would handle this with actual redirect API)
              setTimeout(() => router.navigate(newPath), 100);

              return null;
            },
            component: () => {
              app.innerHTML = `
                <div style="padding: 32px; text-align: center;">
                  <p style="color: #666;">Redirecting...</p>
                </div>
              `;
            }
          }),

          // Short link expander
          route({
            path: '/s/:shortId',
            loader: ({ params }) => {
              const destination = shortLinks[params.shortId];

              if (!destination) {
                logger.log(`❌ Invalid short link: ${params.shortId}`);
                throw new Error('Short link not found');
              }

              logger.log(`🔀 Short link /s/${params.shortId} → ${destination}`);

              setTimeout(() => router.navigate(destination), 100);

              return null;
            },
            component: () => {
              app.innerHTML = `
                <div style="padding: 32px; text-align: center;">
                  <p style="color: #666;">Expanding short link...</p>
                </div>
              `;
            }
          }),

          // Conditional redirect based on state
          route({
            path: '/empty-cart-checkout',
            loader: () => {
              // Simulate checking cart
              const cartItems = [];

              if (cartItems.length === 0) {
                logger.log('🔀 Cart empty, redirecting to shop');
                setTimeout(() => router.navigate('/shop'), 100);
                return null;
              }

              return { items: cartItems };
            },
            component: () => {
              app.innerHTML = `
                <div style="padding: 32px; text-align: center;">
                  <p style="color: #666;">Checking cart...</p>
                </div>
              `;
            }
          }),

          // Product pages (destination)
          route({
            path: '/products/:id',
            component: (match) => {
              const discount = match.query.get('discount');
              const sale = match.query.get('sale');

              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Product: ${match.params.id}</h2>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Successfully redirected to new URL
                </div>
                ${discount ? `<p style="color: #060; font-weight: bold;">🎉 ${discount}% discount applied!</p>` : ''}
                ${sale ? `<p style="color: #060; font-weight: bold;">🎉 On sale!</p>` : ''}
                <p style="font-size: 12px; color: #666; margin-top: 12px;">
                  Final URL: ${match.path}${match.query.toString() ? '?' + match.query.toString() : ''}
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Examples</a>
              `;
              logger.log(`✓ Rendered product page: ${match.params.id}`);
            }
          }),

          // Shop page (redirect destination)
          route({
            path: '/shop',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Shop</h2>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Redirected here because cart was empty
                </div>
                <p style="margin: 0 0 12px 0;">Add items to your cart before checking out.</p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Examples</a>
              `;
              logger.log('✓ Rendered shop page (redirect destination)');
            }
          })
        ],

        ssr: true
      });

      logger.log('Router initialized with programmatic redirects');
      logger.log('Click links to see redirects in action');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
