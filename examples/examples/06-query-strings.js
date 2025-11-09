/**
 * Example 06: Query Strings
 * Reading ?search=foo&filter=bar from URLs
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Intermediate</span>
      </div>

      <h1 class="example-title">06. Query Strings</h1>
      <p class="example-description">
        Query strings (the <code>?key=value&amp;other=data</code> part of URLs) are perfect
        for search, filters, and state that should be shareable via URL.
      </p>

      <h2 class="section-heading">Accessing Query Parameters</h2>
      <p>
        The router provides query parameters via <code>match.query</code>, which is a
        native <code>URLSearchParams</code> object.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/search',
      component: (match) => {
        // Access query parameters
        const searchTerm = match.query.get('q');
        const category = match.query.get('category');
        const page = match.query.get('page') || '1';

        render(\`
          <h1>Search Results</h1>
          <p>Query: \${searchTerm}</p>
          <p>Category: \${category || 'All'}</p>
          <p>Page: \${page}</p>
        \`);
      }
    })
  ]
});

// URL: /search?q=router&category=tech&page=2
// Result:
// - searchTerm: "router"
// - category: "tech"
// - page: "2"
      `, 'query-strings.js')}\n
      <h2 class="section-heading">URLSearchParams API</h2>
      <p>
        <code>match.query</code> is a standard <code>URLSearchParams</code> object,
        giving you access to all its methods:
      </p>

      ${createCodeBlock(`
route({
  path: '/products',
  component: (match) => {
    const query = match.query;

    // Get a single value
    const search = query.get('search');  // "laptop" or null

    // Check if parameter exists
    const hasFilter = query.has('filter');  // true or false

    // Get all values for a key (for repeated params)
    const tags = query.getAll('tag');  // ["new", "sale", "featured"]

    // Iterate over all parameters
    for (const [key, value] of query.entries()) {
      console.log(\`\${key}: \${value}\`);
    }

    // Convert to plain object (if needed)
    const params = Object.fromEntries(query.entries());
    // { search: "laptop", filter: "price" }
  }
})
      `, 'urlsearchparams.js')}\n
      <h2 class="section-heading">Building URLs with Query Strings</h2>
      <p>
        To navigate with query parameters, you can manually build the query string
        or use <code>URLSearchParams</code> to construct it:
      </p>

      ${createCodeBlock(`
// Manual query string
router.navigate('/search?q=hello&category=docs');

// Using URLSearchParams (recommended for complex queries)
const params = new URLSearchParams({
  q: 'overhead router',
  category: 'libraries',
  page: '1'
});
router.navigate(\`/search?\${params.toString()}\`);

// Or use links
const query = new URLSearchParams({ q: 'test', filter: 'new' });
render(\`<a href="/search?\${query}">Search</a>\`);
      `, 'building-queries.js')}\n
      <h2 class="section-heading">Common Patterns</h2>
      <p>
        Query strings are ideal for features that should be:
      </p>
      <ul>
        <li><strong>Shareable</strong> - Users can copy the URL to share exact search/filter state</li>
        <li><strong>Bookmarkable</strong> - Saved URLs restore the exact view</li>
        <li><strong>Browser-friendly</strong> - Back button works with query changes</li>
        <li><strong>SEO-friendly</strong> - Search engines can index filtered/sorted views</li>
      </ul>

      ${createCodeBlock(`
// Search with autocomplete
route({
  path: '/search',
  component: (match) => {
    const q = match.query.get('q') || '';
    render(\`
      <input type="search" value="\${q}"
             oninput="updateSearch(this.value)">
      <div id="results">Searching for: \${q}</div>
    \`);
  }
});

function updateSearch(value) {
  const params = new URLSearchParams({ q: value });
  router.navigate(\`/search?\${params}\`, { replace: true });
}
      `, 'search-pattern.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a product search with filters. Type in the search box or toggle
        filters to see query parameters update in real-time.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Important Notes</h2>
      <ul>
        <li><strong>Always strings</strong> - Query values are always strings (like route params)</li>
        <li><strong>Null for missing</strong> - <code>query.get('missing')</code> returns <code>null</code></li>
        <li><strong>URL encoding</strong> - Values are automatically encoded/decoded</li>
        <li><strong>Case sensitive</strong> - Parameter names are case-sensitive</li>
        <li><strong>Order independent</strong> - <code>?a=1&b=2</code> equals <code>?b=2&a=1</code></li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered query strings for search and filters. Next, we'll explore hash
        navigation for URL fragments like <code>#section-id</code> and scroll behavior.
      </p>

      <div class="navigation-controls">
        <a href="/examples/05-using-parameters" class="nav-button">← Previous: Using Parameters</a>
        <a href="/examples/07-hash-navigation" class="nav-button">Next: Hash Navigation →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Query Strings Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Mock product database
      const allProducts = [
        { id: 1, name: 'Wireless Mouse', category: 'accessories', inStock: true },
        { id: 2, name: 'Mechanical Keyboard', category: 'accessories', inStock: true },
        { id: 3, name: 'USB-C Hub', category: 'accessories', inStock: false },
        { id: 4, name: 'Monitor Stand', category: 'furniture', inStock: true },
        { id: 5, name: 'Desk Lamp', category: 'furniture', inStock: true },
        { id: 6, name: 'Laptop Sleeve', category: 'cases', inStock: true }
      ];

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 200px;">
          <p style="color: #666;">Loading search...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/search',
            component: (match) => {
              const searchTerm = (match.query.get('q') || '').toLowerCase();
              const category = match.query.get('category');
              const inStock = match.query.get('inStock') === 'true';

              logger.log(`Query params: q="${searchTerm}", category="${category}", inStock=${inStock}`);

              // Filter products
              let products = allProducts;

              if (searchTerm) {
                products = products.filter(p =>
                  p.name.toLowerCase().includes(searchTerm)
                );
              }

              if (category) {
                products = products.filter(p => p.category === category);
              }

              if (inStock) {
                products = products.filter(p => p.inStock);
              }

              logger.log(`Found ${products.length} matching products`);

              // Build filter UI
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Product Search</h2>

                <div style="margin-bottom: 16px;">
                  <input
                    type="search"
                    id="search-input"
                    value="${searchTerm}"
                    placeholder="Search products..."
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; font-family: inherit;"
                  >
                </div>

                <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                  <label style="display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="filter-accessories" ${category === 'accessories' ? 'checked' : ''}>
                    Accessories
                  </label>
                  <label style="display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="filter-furniture" ${category === 'furniture' ? 'checked' : ''}>
                    Furniture
                  </label>
                  <label style="display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="filter-cases" ${category === 'cases' ? 'checked' : ''}>
                    Cases
                  </label>
                  <label style="display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="filter-stock" ${inStock ? 'checked' : ''}>
                    In Stock Only
                  </label>
                </div>

                <div style="border-top: 1px solid #ddd; padding-top: 12px;">
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    ${products.length} result${products.length !== 1 ? 's' : ''}
                  </p>
                  ${products.length > 0 ? `
                    <div style="display: grid; gap: 8px;">
                      ${products.map(p => `
                        <div style="padding: 8px; border: 1px solid #eee;">
                          <strong>${p.name}</strong>
                          <span style="color: #666; font-size: 12px; margin-left: 8px;">
                            ${p.category} · ${p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  ` : '<p style="color: #999;">No products found</p>'}
                </div>
              `;

              // Add event listeners
              const searchInput = app.querySelector('#search-input');
              searchInput.addEventListener('input', (e) => {
                updateQuery({ q: e.target.value });
              });

              app.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                  const categoryChecks = {
                    accessories: app.querySelector('#filter-accessories').checked,
                    furniture: app.querySelector('#filter-furniture').checked,
                    cases: app.querySelector('#filter-cases').checked
                  };

                  const selectedCategory = Object.entries(categoryChecks)
                    .find(([_, checked]) => checked)?.[0] || null;

                  const stockChecked = app.querySelector('#filter-stock').checked;

                  updateQuery({
                    q: searchInput.value,
                    category: selectedCategory,
                    inStock: stockChecked ? 'true' : null
                  });
                });
              });

              function updateQuery(updates) {
                const params = new URLSearchParams();

                if (updates.q) params.set('q', updates.q);
                if (updates.category) params.set('category', updates.category);
                if (updates.inStock === 'true') params.set('inStock', 'true');

                const queryString = params.toString();
                const newUrl = queryString ? `/search?${queryString}` : '/search';

                logger.log(`Navigating to: ${newUrl}`);
                router.navigate(newUrl, { replace: true });
              }
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with query string support');
      logger.log('Type or toggle filters to see query updates');

      // Start with default view
      router.navigate('/search');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
