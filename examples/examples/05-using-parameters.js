/**
 * Example 05: Using Parameters
 * Accessing params in components and using them practically
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Beginner</span>
      </div>

      <h1 class="example-title">05. Using Parameters</h1>
      <p class="example-description">
        Now that you can extract parameters, let's use them for real work: fetching data,
        building dynamic UIs, and validating input.
      </p>

      <h2 class="section-heading">Accessing Parameters</h2>
      <p>
        Parameters are available in your component function via <code>match.params</code>.
        This object contains all extracted parameters as strings.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/products/:productId',
      component: async (match) => {
        // Extract the parameter
        const { productId } = match.params;

        // Fetch data using the parameter
        const response = await fetch(\`/api/products/\${productId}\`);
        const product = await response.json();

        // Render with the data
        render(\`
          <h1>\${product.name}</h1>
          <p>Price: $\${product.price}</p>
          <p>Stock: \${product.stock} units</p>
        \`);
      }
    })
  ]
});

function render(html) {
  document.getElementById('app').innerHTML = html;
}
      `, 'using-params.js')}\n
      <h2 class="section-heading">Type Conversion</h2>
      <p>
        Remember: parameters are always strings. If you need numbers, booleans, or other types,
        you must convert them yourself.
      </p>

      ${createCodeBlock(`
route({
  path: '/users/:userId/page/:pageNum',
  component: (match) => {
    const { userId, pageNum } = match.params;

    // Convert string to number
    const page = parseInt(pageNum, 10);

    // Validate the conversion
    if (isNaN(page) || page < 1) {
      render('<h1>Invalid page number</h1>');
      return;
    }

    // Use the converted value
    fetchUsers(userId, page);
  }
})
      `, 'type-conversion.js')}\n
      <h2 class="section-heading">Parameter Validation</h2>
      <p>
        Always validate parameters before using them. Users can type anything into the URL,
        so defensive coding is essential.
      </p>

      ${createCodeBlock(`
route({
  path: '/posts/:postId',
  component: async (match) => {
    const { postId } = match.params;

    // Validate format (example: only alphanumeric + hyphens)
    if (!/^[a-z0-9-]+$/i.test(postId)) {
      render('<h1>Invalid post ID format</h1>');
      return;
    }

    // Fetch and check existence
    const response = await fetch(\`/api/posts/\${postId}\`);

    if (!response.ok) {
      render('<h1>Post not found</h1>');
      return;
    }

    const post = await response.json();
    render(\`<h1>\${post.title}</h1>\`);
  }
})
      `, 'validation.js')}\n
      <h2 class="section-heading">Building URLs with Parameters</h2>
      <p>
        Need to navigate to a parameterized route? Use template strings to build the URL:
      </p>

      ${createCodeBlock(`
// Navigate to a specific user
const userId = 'alice';
router.navigate(\`/users/\${userId}\`);

// Navigate with multiple params
const productId = '42';
const reviewId = '7';
router.navigate(\`/products/\${productId}/reviews/\${reviewId}\`);

// Or use links
render(\`
  <a href="/users/\${userId}">View Profile</a>
  <a href="/products/\${productId}">View Product</a>
\`);
      `, 'building-urls.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a product catalog where clicking a product uses its ID parameter
        to "fetch" and display details. Notice parameter validation and type conversion.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Validate early</strong> - Check parameters before doing expensive work</li>
        <li><strong>Handle errors</strong> - Show user-friendly messages for invalid params</li>
        <li><strong>Type conversion</strong> - Explicitly convert to needed types with validation</li>
        <li><strong>URL encoding</strong> - Parameters are automatically decoded, but encode when building URLs</li>
        <li><strong>Security</strong> - Never trust user input; validate and sanitize</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered the beginner fundamentals! Next, we'll explore intermediate topics
        starting with query strings for handling <code>?search=foo&amp;filter=bar</code> patterns.
      </p>

      <div class="navigation-controls">
        <a href="/examples/04-route-parameters" class="nav-button">← Previous: Route Parameters</a>
        <a href="/examples/06-query-strings" class="nav-button">Next: Query Strings →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Using Parameters Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Mock product database
      const products = {
        '1': { id: 1, name: 'Wireless Mouse', price: 29.99, stock: 42 },
        '2': { id: 2, name: 'Mechanical Keyboard', price: 89.99, stock: 15 },
        '3': { id: 3, name: 'USB-C Hub', price: 49.99, stock: 28 },
        '99': { id: 99, name: 'Out of Stock Item', price: 19.99, stock: 0 }
      };

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 160px;">
          <p style="color: #666;">Loading catalog...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Product Catalog</h2>
                <nav style="display: grid; gap: 8px;">
                  ${Object.values(products).map(p => `
                    <a href="/products/${p.id}" style="color: #000; text-decoration: underline;">
                      → ${p.name} ($${p.price})
                    </a>
                  `).join('')}
                  <a href="/products/invalid" style="color: #000; text-decoration: underline;">
                    → Invalid Product (test error handling)
                  </a>
                </nav>
              `;
              logger.log('Rendered: Product catalog');
            }
          }),

          route({
            path: '/products/:productId',
            component: (match) => {
              const { productId } = match.params;

              logger.log(`Extracted param: { productId: "${productId}" }`);

              // Validate: must be numeric
              const id = parseInt(productId, 10);
              if (isNaN(id)) {
                app.innerHTML = `
                  <h2 style="margin: 0 0 12px 0; color: #d00;">Invalid Product ID</h2>
                  <p style="margin: 0 0 12px 0;">
                    Product ID must be numeric, got: "${productId}"
                  </p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Back to Catalog</a>
                `;
                logger.log('❌ Validation failed: Not a number');
                return;
              }

              logger.log(`✓ Validation passed: Converted to number ${id}`);

              // "Fetch" product (simulate API call)
              const product = products[productId];

              if (!product) {
                app.innerHTML = `
                  <h2 style="margin: 0 0 12px 0; color: #d00;">Product Not Found</h2>
                  <p style="margin: 0 0 12px 0;">No product with ID: ${productId}</p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Back to Catalog</a>
                `;
                logger.log('❌ Product not found in database');
                return;
              }

              logger.log(`✓ Product found: ${product.name}`);

              // Render product details
              const stockStatus = product.stock > 0
                ? `${product.stock} units available`
                : 'Out of stock';

              const stockColor = product.stock > 0 ? '#060' : '#d00';

              app.innerHTML = `
                <h2 style="margin: 0 0 8px 0;">${product.name}</h2>
                <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: bold;">$${product.price}</p>
                <p style="margin: 0 0 12px 0; color: ${stockColor};">${stockStatus}</p>
                <p style="margin: 0 0 12px 0; font-family: monospace; font-size: 11px; color: #999;">
                  productId: "${productId}" (type: ${typeof productId})
                  <br>
                  converted: ${id} (type: ${typeof id})
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Catalog</a>
              `;

              logger.log('✓ Rendered product details');
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with validation logic');
      logger.log('Try clicking products (including invalid one)');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
