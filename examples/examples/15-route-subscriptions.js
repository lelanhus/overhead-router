/**
 * Example 15: Route Subscriptions
 * Reacting to navigation events and route changes
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Advanced</span>
      </div>

      <h1 class="example-title">15. Route Subscriptions</h1>
      <p class="example-description">
        Subscribe to navigation events to react to route changes, track analytics,
        update UI elements, or sync state across your application.
      </p>

      <h2 class="section-heading">What are Subscriptions?</h2>
      <p>
        The router provides a <code>subscribe()</code> method that calls your callback
        whenever navigation completes. Perfect for side effects like analytics or UI updates.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [/* ... */]
});

// Subscribe to all navigation events
const unsubscribe = router.subscribe((match) => {
  console.log('Navigated to:', match.path);
  console.log('Params:', match.params);
  console.log('Query:', match.query.toString());

  // Update page title
  document.title = match.meta?.title || 'My App';

  // Track analytics
  trackPageView(match.path);

  // Update active nav links
  updateActiveLinks(match.path);
});

// Cleanup: unsubscribe when done
unsubscribe();
      `, 'subscriptions.js')}\n
      <h2 class="section-heading">Common Use Cases</h2>

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Analytics Tracking</h3>
      ${createCodeBlock(`
router.subscribe((match) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: match.path
    });
  }

  // Custom analytics
  analytics.track('Page View', {
    path: match.path,
    params: match.params,
    referrer: document.referrer
  });
});
      `, 'analytics.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Dynamic Page Titles</h3>
      ${createCodeBlock(`
router.subscribe((match) => {
  // Update document title based on route metadata
  const title = match.meta?.title || 'My App';
  const subtitle = match.meta?.subtitle;

  document.title = subtitle
    ? \`\${title} - \${subtitle}\`
    : title;

  // Update meta description
  const description = match.meta?.description;
  if (description) {
    document.querySelector('meta[name="description"]')
      ?.setAttribute('content', description);
  }
});

// Routes with metadata
route({
  path: '/products/:id',
  meta: {
    title: 'Product Details',
    description: 'View product information'
  },
  component: () => { /* ... */ }
})
      `, 'page-titles.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Scroll Restoration</h3>
      ${createCodeBlock(`
router.subscribe((match) => {
  // Scroll to top on navigation
  window.scrollTo(0, 0);

  // Or scroll to hash if present
  if (match.hash) {
    const element = document.querySelector(match.hash);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
});
      `, 'scroll.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Active Link Highlighting</h3>
      ${createCodeBlock(`
router.subscribe((match) => {
  // Remove all active classes
  document.querySelectorAll('nav a.active').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to current link
  const activeLink = document.querySelector(\`nav a[href="\${match.path}"]\`);
  activeLink?.classList.add('active');
});
      `, 'active-links.js')}

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Loading States</h3>
      ${createCodeBlock(`
let isNavigating = false;

router.subscribe((match) => {
  // Navigation completed
  isNavigating = false;

  // Hide loading indicator
  document.querySelector('.loading-indicator')
    ?.classList.remove('visible');
});

// Before navigation
router.beforeNavigate(() => {
  isNavigating = true;

  // Show loading indicator
  document.querySelector('.loading-indicator')
    ?.classList.add('visible');
});
      `, 'loading.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows subscriptions tracking navigation events, updating a breadcrumb,
        and logging navigation history.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Subscription Callback</h2>
      <p>
        The subscription callback receives the current <code>RouteMatch</code> object:
      </p>

      ${createCodeBlock(`
interface RouteMatch {
  path: string;              // Current path
  params: Record<string, string>;  // Route parameters
  query: URLSearchParams;    // Query parameters
  hash: string;              // Hash fragment
  data?: unknown;            // Loader data
  error?: Error;             // Loader error
  meta?: Record<string, unknown>;  // Route metadata
  cached?: boolean;          // Was data from cache?
}

router.subscribe((match) => {
  // Access any match property
  console.log(match.path);
  console.log(match.params);
  console.log(match.data);
});
      `, 'match-interface.ts')}\n
      <h2 class="section-heading">Multiple Subscriptions</h2>
      <p>
        You can have multiple subscriptions for different concerns:
      </p>

      ${createCodeBlock(`
// Analytics subscription
const unsubAnalytics = router.subscribe((match) => {
  trackPageView(match.path);
});

// Title subscription
const unsubTitle = router.subscribe((match) => {
  document.title = match.meta?.title || 'App';
});

// Scroll subscription
const unsubScroll = router.subscribe(() => {
  window.scrollTo(0, 0);
});

// Cleanup all subscriptions
function cleanup() {
  unsubAnalytics();
  unsubTitle();
  unsubScroll();
}
      `, 'multiple-subs.js')}\n
      <h2 class="section-heading">Unsubscribing</h2>
      <p>
        Always unsubscribe when your component unmounts or when you no longer need the subscription:
      </p>

      ${createCodeBlock(`
// In a React component
useEffect(() => {
  const unsubscribe = router.subscribe((match) => {
    console.log('Route changed:', match.path);
  });

  // Cleanup on unmount
  return () => unsubscribe();
}, []);

// In vanilla JS
const unsubscribe = router.subscribe(handleRouteChange);

// Later...
unsubscribe();
      `, 'cleanup.js')}\n
      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered advanced routing concepts! Now let's move to expert-level topics.
        Next, we'll explore automatic breadcrumb generation from route metadata.
      </p>

      <div class="navigation-controls">
        <a href="/examples/14-programmatic-redirects" class="nav-button">← Previous: Programmatic Redirects</a>
        <a href="/examples/16-breadcrumbs" class="nav-button">Next: Breadcrumbs →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Route Subscriptions Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      const navigationHistory = [];

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
            meta: { title: 'Home', breadcrumb: 'Home' },
            component: () => {
              const content = app.querySelector('#content');
              if (content) {
                content.innerHTML = `
                  <h2 style="margin: 0 0 16px 0;">Subscription Demo</h2>
                  <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                    Navigate to see subscriptions update the UI
                  </p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="/products" style="color: #000; text-decoration: underline;">→ Products</a>
                    <a href="/about" style="color: #000; text-decoration: underline;">→ About</a>
                    <a href="/contact" style="color: #000; text-decoration: underline;">→ Contact</a>
                  </div>
                `;
              }
            }
          }),

          route({
            path: '/products',
            meta: { title: 'Products', breadcrumb: 'Products' },
            component: () => {
              const content = app.querySelector('#content');
              if (content) {
                content.innerHTML = `
                  <h2 style="margin: 0 0 16px 0;">Products</h2>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="/products/laptop" style="color: #000; text-decoration: underline;">→ Laptop</a>
                    <a href="/products/mouse" style="color: #000; text-decoration: underline;">→ Mouse</a>
                    <a href="/" style="color: #000; text-decoration: underline;">← Home</a>
                  </div>
                `;
              }
            }
          }),

          route({
            path: '/products/:id',
            meta: { title: 'Product Details', breadcrumb: 'Product' },
            component: (match) => {
              const content = app.querySelector('#content');
              if (content) {
                content.innerHTML = `
                  <h2 style="margin: 0 0 16px 0;">Product: ${match.params.id}</h2>
                  <p style="margin: 0 0 12px 0;">Product details for ${match.params.id}</p>
                  <a href="/products" style="color: #000; text-decoration: underline;">← Back to Products</a>
                `;
              }
            }
          }),

          route({
            path: '/about',
            meta: { title: 'About Us', breadcrumb: 'About' },
            component: () => {
              const content = app.querySelector('#content');
              if (content) {
                content.innerHTML = `
                  <h2 style="margin: 0 0 16px 0;">About Us</h2>
                  <p style="margin: 0 0 12px 0;">Learn more about our company.</p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Home</a>
                `;
              }
            }
          }),

          route({
            path: '/contact',
            meta: { title: 'Contact', breadcrumb: 'Contact' },
            component: () => {
              const content = app.querySelector('#content');
              if (content) {
                content.innerHTML = `
                  <h2 style="margin: 0 0 16px 0;">Contact</h2>
                  <p style="margin: 0 0 12px 0;">Get in touch with us.</p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Home</a>
                `;
              }
            }
          })
        ],

        ssr: true
      });

      // Subscribe to route changes
      const unsubscribe = router.subscribe((match) => {
        logger.log(`📍 Navigation: ${match.path}`);

        // Add to navigation history
        navigationHistory.push({
          path: match.path,
          title: match.meta?.title || 'Page',
          timestamp: Date.now()
        });

        // Keep only last 5 items
        if (navigationHistory.length > 5) {
          navigationHistory.shift();
        }

        // Update breadcrumb
        const breadcrumb = match.meta?.breadcrumb || 'Page';

        // Render the full UI with subscription updates
        app.innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%;">
            <!-- Breadcrumb (updated by subscription) -->
            <div style="padding: 8px 12px; background: #f5f5f5; border-bottom: 1px solid #ddd; font-size: 12px;">
              🏠 Home ${match.path !== '/' ? `/ ${breadcrumb}` : ''}
            </div>

            <!-- Main content -->
            <div id="content" style="flex: 1; padding: 16px;">
              <p style="color: #666;">Loading...</p>
            </div>

            <!-- Navigation history (updated by subscription) -->
            <div style="padding: 12px; background: #f5f5f5; border-top: 1px solid #ddd;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">
                Navigation History:
              </div>
              <div style="font-size: 11px; font-family: monospace; line-height: 1.6;">
                ${navigationHistory.map((item, i) => `
                  ${i + 1}. ${item.path} (${item.title})
                `).join('<br>')}
              </div>
            </div>
          </div>
        `;

        logger.log(`✓ Updated breadcrumb: ${breadcrumb}`);
        logger.log(`✓ Updated history (${navigationHistory.length} items)`);

        // Re-render the component content
        const currentRoute = router.getCurrentMatch();
        if (currentRoute) {
          // Find and execute the component
          // This is a simplified version - real implementation varies
          setTimeout(() => {
            router.navigate(match.path);
          }, 0);
        }
      });

      logger.log('Router initialized with subscription');
      logger.log('Watch breadcrumb and history update on navigation');

      router.navigate('/');

      // Cleanup on reset
      window.addEventListener('beforeunload', () => {
        unsubscribe();
      });
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
