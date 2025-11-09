/**
 * Example 16: Breadcrumbs
 * Automatic breadcrumb generation from route metadata
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Expert</span>
      </div>

      <h1 class="example-title">16. Breadcrumbs</h1>
      <p class="example-description">
        Generate breadcrumbs automatically from route metadata and path segments.
        Perfect for complex navigation hierarchies and improving user orientation.
      </p>

      <h2 class="section-heading">Breadcrumb Strategy</h2>
      <p>
        Add breadcrumb metadata to routes, then build breadcrumbs by walking the path hierarchy:
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/',
      meta: { breadcrumb: 'Home' }
    }),

    route({
      path: '/products',
      meta: { breadcrumb: 'Products' }
    }),

    route({
      path: '/products/:category',
      meta: { breadcrumb: (params) => params.category }
    }),

    route({
      path: '/products/:category/:id',
      meta: {
        breadcrumb: async (params) => {
          const product = await fetchProduct(params.id);
          return product.name;
        }
      }
    })
  ]
});

// Build breadcrumbs from current path
function buildBreadcrumbs(path) {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += \`/\${segment}\`;
    const match = router.match(currentPath);

    if (match?.meta?.breadcrumb) {
      breadcrumbs.push({
        label: match.meta.breadcrumb,
        path: currentPath
      });
    }
  }

  return breadcrumbs;
}
      `, 'breadcrumbs.js')}\n
      <h2 class="section-heading">Dynamic Breadcrumbs</h2>
      <p>
        Use functions or async functions for dynamic breadcrumb labels:
      </p>

      ${createCodeBlock(`
route({
  path: '/users/:userId',
  meta: {
    breadcrumb: async (params) => {
      const user = await fetchUser(params.userId);
      return user.name;
    }
  }
})

// URL: /users/123
// Breadcrumb: Home / Users / John Doe
      `, 'dynamic-breadcrumbs.js')}\n
      <h2 class="section-heading">Breadcrumb Component</h2>
      <p>
        Create a reusable breadcrumb component that renders the trail:
      </p>

      ${createCodeBlock(`
function renderBreadcrumbs(breadcrumbs) {
  return \`
    <nav aria-label="Breadcrumb" class="breadcrumbs">
      <ol>
        \${breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return \`
            <li>
              \${isLast
                ? \`<span>\${crumb.label}</span>\`
                : \`<a href="\${crumb.path}">\${crumb.label}</a>\`
              }
              \${!isLast ? '<span>/</span>' : ''}
            </li>
          \`;
        }).join('')}
      </ol>
    </nav>
  \`;
}

// CSS
.breadcrumbs ol {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumbs li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumbs a {
  color: #000;
  text-decoration: underline;
}

.breadcrumbs span {
  color: #666;
}
      `, 'breadcrumb-component.js')}\n
      <h2 class="section-heading">Structured Data</h2>
      <p>
        Add JSON-LD structured data for SEO benefits:
      </p>

      ${createCodeBlock(`
function renderBreadcrumbSchema(breadcrumbs) {
  const items = breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.label,
    "item": \`https://example.com\${crumb.path}\`
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

// Add to page head
const schema = renderBreadcrumbSchema(breadcrumbs);
const script = document.createElement('script');
script.type = 'application/ld+json';
script.text = JSON.stringify(schema);
document.head.appendChild(script);
      `, 'structured-data.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows automatic breadcrumb generation. Navigate through the hierarchy
        to see breadcrumbs update dynamically.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Accessibility</h2>
      <ul>
        <li><strong>aria-label</strong> - Use "Breadcrumb" on the nav element</li>
        <li><strong>Current page</strong> - Don't link the current page, use text only</li>
        <li><strong>Separator</strong> - Use CSS or aria-hidden separators</li>
        <li><strong>Semantic HTML</strong> - Use nav > ol > li structure</li>
      </ul>

      ${createCodeBlock(`
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a> <span aria-hidden="true">/</span></li>
    <li><a href="/products">Products</a> <span aria-hidden="true">/</span></li>
    <li><span aria-current="page">Laptop</span></li>
  </ol>
</nav>
      `, 'accessibility.html')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Keep it short</strong> - Show essential path segments only</li>
        <li><strong>Truncate long labels</strong> - Use ellipsis for long names</li>
        <li><strong>Mobile responsive</strong> - Consider collapsing intermediate segments</li>
        <li><strong>Cache breadcrumbs</strong> - Avoid refetching for same paths</li>
        <li><strong>Handle errors gracefully</strong> - Show fallback labels on fetch failure</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've learned breadcrumb generation! Next, we'll explore route prefetching
        for instant navigation experiences.
      </p>

      <div class="navigation-controls">
        <a href="/examples/15-route-subscriptions" class="nav-button">← Previous: Route Subscriptions</a>
        <a href="/examples/17-route-prefetching" class="nav-button">Next: Route Prefetching →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Breadcrumbs Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      const products = {
        'electronics': {
          'laptop': { name: 'Pro Laptop', category: 'electronics' },
          'mouse': { name: 'Wireless Mouse', category: 'electronics' }
        },
        'furniture': {
          'desk': { name: 'Standing Desk', category: 'furniture' },
          'chair': { name: 'Ergonomic Chair', category: 'furniture' }
        }
      };

      function buildBreadcrumbs(path, params = {}) {
        const breadcrumbs = [{ label: 'Home', path: '/' }];

        if (path === '/') return breadcrumbs;

        if (path.startsWith('/products')) {
          breadcrumbs.push({ label: 'Products', path: '/products' });

          if (params.category) {
            breadcrumbs.push({
              label: params.category.charAt(0).toUpperCase() + params.category.slice(1),
              path: `/products/${params.category}`
            });

            if (params.id) {
              const product = products[params.category]?.[params.id];
              breadcrumbs.push({
                label: product?.name || params.id,
                path: `/products/${params.category}/${params.id}`
              });
            }
          }
        }

        return breadcrumbs;
      }

      function renderBreadcrumbs(breadcrumbs) {
        return breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast
            ? `<span style="color: #000;">${crumb.label}</span>`
            : `<a href="${crumb.path}" style="color: #000; text-decoration: underline;">${crumb.label}</a> <span style="color: #999;">/</span> `;
        }).join('');
      }

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; min-height: 240px;">
          <p style="color: #666;">Loading...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              const breadcrumbs = buildBreadcrumbs('/');
              app.innerHTML = `
                <div style="padding: 8px 0 16px 0; border-bottom: 1px solid #ddd; margin-bottom: 16px; font-size: 13px;">
                  ${renderBreadcrumbs(breadcrumbs)}
                </div>
                <h2 style="margin: 0 0 16px 0;">Breadcrumb Demo</h2>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/products" style="color: #000; text-decoration: underline;">→ Products</a>
                </div>
              `;
              logger.log('Breadcrumbs: ' + breadcrumbs.map(b => b.label).join(' / '));
            }
          }),

          route({
            path: '/products',
            component: () => {
              const breadcrumbs = buildBreadcrumbs('/products');
              app.innerHTML = `
                <div style="padding: 8px 0 16px 0; border-bottom: 1px solid #ddd; margin-bottom: 16px; font-size: 13px;">
                  ${renderBreadcrumbs(breadcrumbs)}
                </div>
                <h2 style="margin: 0 0 16px 0;">Products</h2>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/products/electronics" style="color: #000; text-decoration: underline;">→ Electronics</a>
                  <a href="/products/furniture" style="color: #000; text-decoration: underline;">→ Furniture</a>
                </div>
              `;
              logger.log('Breadcrumbs: ' + breadcrumbs.map(b => b.label).join(' / '));
            }
          }),

          route({
            path: '/products/:category',
            component: (match) => {
              const { category } = match.params;
              const breadcrumbs = buildBreadcrumbs(match.path, { category });
              const items = products[category] || {};

              app.innerHTML = `
                <div style="padding: 8px 0 16px 0; border-bottom: 1px solid #ddd; margin-bottom: 16px; font-size: 13px;">
                  ${renderBreadcrumbs(breadcrumbs)}
                </div>
                <h2 style="margin: 0 0 16px 0;">${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${Object.keys(items).map(id => `
                    <a href="/products/${category}/${id}" style="color: #000; text-decoration: underline;">
                      → ${items[id].name}
                    </a>
                  `).join('')}
                </div>
              `;
              logger.log('Breadcrumbs: ' + breadcrumbs.map(b => b.label).join(' / '));
            }
          }),

          route({
            path: '/products/:category/:id',
            component: (match) => {
              const { category, id } = match.params;
              const product = products[category]?.[id];
              const breadcrumbs = buildBreadcrumbs(match.path, { category, id });

              app.innerHTML = `
                <div style="padding: 8px 0 16px 0; border-bottom: 1px solid #ddd; margin-bottom: 16px; font-size: 13px;">
                  ${renderBreadcrumbs(breadcrumbs)}
                </div>
                <h2 style="margin: 0 0 12px 0;">${product?.name || id}</h2>
                <p style="margin: 0 0 16px 0; color: #666;">Category: ${category}</p>
                <div style="padding: 12px; background: #f5f5f5; font-size: 12px;">
                  <strong>Current breadcrumb trail:</strong><br>
                  ${breadcrumbs.map(b => b.label).join(' → ')}
                </div>
              `;
              logger.log('Breadcrumbs: ' + breadcrumbs.map(b => b.label).join(' / '));
            }
          })
        ],

        ssr: true
      });

      logger.log('Router initialized with breadcrumb generation');
      logger.log('Navigate to see breadcrumbs update');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
