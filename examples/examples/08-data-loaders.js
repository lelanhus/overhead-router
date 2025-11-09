/**
 * Example 08: Data Loaders
 * Async data fetching with loaders that run before components
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Intermediate</span>
      </div>

      <h1 class="example-title">08. Data Loaders</h1>
      <p class="example-description">
        Loaders are async functions that fetch data before your component renders.
        They separate data fetching from rendering, making your code cleaner and more maintainable.
      </p>

      <h2 class="section-heading">What is a Loader?</h2>
      <p>
        A loader is an async function that runs before your component. It receives route context
        (params, query, hash, signal) and returns data that gets passed to your component.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/users/:userId',

      // Loader: Fetches data before component renders
      loader: async ({ params, signal }) => {
        const response = await fetch(
          \`/api/users/\${params.userId}\`,
          { signal }
        );
        return response.json();
      },

      // Component: Receives loader data
      component: (match) => {
        const user = match.data;  // Data from loader

        render(\`
          <h1>\${user.name}</h1>
          <p>Email: \${user.email}</p>
          <p>Role: \${user.role}</p>
        \`);
      }
    })
  ]
});

function render(html) {
  document.getElementById('app').innerHTML = html;
}
      `, 'data-loaders.js')}\n
      <h2 class="section-heading">Loader Context</h2>
      <p>
        Loaders receive a context object with everything needed to fetch the right data:
      </p>

      ${createCodeBlock(`
loader: async (context) => {
  const {
    params,  // Route parameters { userId: "123" }
    query,   // URLSearchParams from query string
    hash,    // Hash fragment (with #)
    signal,  // AbortSignal for cancellation
    context  // Context from guards (if any)
  } = context;

  // Use params for dynamic data
  const userId = params.userId;

  // Use query for filtering/sorting
  const sortBy = query.get('sort') || 'name';
  const filter = query.get('filter');

  // Fetch with abort signal (important!)
  const response = await fetch(
    \`/api/users/\${userId}?sort=\${sortBy}\`,
    { signal }
  );

  return response.json();
}
      `, 'loader-context.js')}\n
      <h2 class="section-heading">Why Use Loaders?</h2>
      <p>
        Loaders provide several benefits over fetching in components:
      </p>
      <ul>
        <li><strong>Separation of concerns</strong> - Data fetching separate from rendering</li>
        <li><strong>Parallel loading</strong> - Nested routes can load data in parallel</li>
        <li><strong>Caching</strong> - Router can cache loader results (covered later)</li>
        <li><strong>Error handling</strong> - Centralized error handling for data fetching</li>
        <li><strong>Type safety</strong> - Loader return type flows to component</li>
        <li><strong>Abort signals</strong> - Automatic cancellation on navigation</li>
      </ul>

      <h2 class="section-heading">Loader Execution Flow</h2>
      <ol>
        <li>User navigates to <code>/users/123</code></li>
        <li>Router matches route and extracts params</li>
        <li><strong>Loader runs</strong> with context (params, query, etc.)</li>
        <li>Loader fetches data and returns it</li>
        <li>Data is attached to <code>match.data</code></li>
        <li><strong>Component runs</strong> with loaded data available</li>
      </ol>

      ${createCodeBlock(`
// Example with loading states
route({
  path: '/products/:id',
  loader: async ({ params, signal }) => {
    // Show loading indicator (component hasn't run yet)
    document.getElementById('app').innerHTML = '<p>Loading product...</p>';

    const res = await fetch(\`/api/products/\${params.id}\`, { signal });

    if (!res.ok) {
      throw new Error('Product not found');
    }

    return res.json();
  },
  component: (match) => {
    const product = match.data;

    // Loader succeeded, render with data
    render(\`
      <h1>\${product.name}</h1>
      <p>Price: $\${product.price}</p>
    \`);
  }
})
      `, 'loading-states.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a user profile with loader-based data fetching. Click users to see
        the loader fetch data before rendering.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Error Handling</h2>
      <p>
        If a loader throws an error, the router catches it and you can handle it in your component
        or with error boundaries:
      </p>

      ${createCodeBlock(`
route({
  path: '/users/:userId',
  loader: async ({ params, signal }) => {
    const res = await fetch(\`/api/users/\${params.userId}\`, { signal });

    if (!res.ok) {
      throw new Error(\`User \${params.userId} not found\`);
    }

    return res.json();
  },
  component: (match) => {
    if (match.error) {
      // Loader threw an error
      render(\`<h1>Error: \${match.error.message}</h1>\`);
      return;
    }

    // Loader succeeded
    const user = match.data;
    render(\`<h1>\${user.name}</h1>\`);
  }
})
      `, 'error-handling.js')}\n
      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've learned how loaders work! But what happens when the user navigates away while
        data is loading? Next, we'll explore abort signals for cancelling in-flight requests.
      </p>

      <div class="navigation-controls">
        <a href="/examples/07-hash-navigation" class="nav-button">← Previous: Hash Navigation</a>
        <a href="/examples/09-abort-signals" class="nav-button">Next: Abort Signals →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Data Loaders Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Mock user database
      const users = {
        '1': { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineer' },
        '2': { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer' },
        '3': { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Product Manager' }
      };

      // Simulate async API call
      function fetchUser(userId) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const user = users[userId];
            if (user) {
              resolve(user);
            } else {
              reject(new Error(`User ${userId} not found`));
            }
          }, 500); // Simulate network delay
        });
      }

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 180px;">
          <p style="color: #666;">Select a user...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 16px 0;">User Directory</h2>
                <nav style="display: flex; flex-direction: column; gap: 8px;">
                  ${Object.values(users).map(u => `
                    <a href="/users/${u.id}" style="color: #000; text-decoration: underline;">
                      → ${u.name} (ID: ${u.id})
                    </a>
                  `).join('')}
                  <a href="/users/999" style="color: #000; text-decoration: underline;">
                    → Invalid User (test error)
                  </a>
                </nav>
              `;
              logger.log('Rendered: User directory');
            }
          }),

          route({
            path: '/users/:userId',

            // Loader: Fetch user data before rendering
            loader: async ({ params, signal }) => {
              const { userId } = params;

              logger.log(\`Loader started for userId: \${userId}\`);

              // Show loading state
              app.innerHTML = `
                <div style="padding: 32px; text-align: center; color: #666;">
                  <p>Loading user ${userId}...</p>
                </div>
              `;

              try {
                const user = await fetchUser(userId);
                logger.log(\`✓ Loader completed: Fetched \${user.name}\`);
                return user;
              } catch (error) {
                logger.log(\`❌ Loader failed: \${error.message}\`);
                throw error;
              }
            },

            // Component: Render with loaded data
            component: (match) => {
              const { userId } = match.params;

              // Check for loader error
              if (match.error) {
                app.innerHTML = `
                  <h2 style="margin: 0 0 12px 0; color: #d00;">Error</h2>
                  <p style="margin: 0 0 12px 0;">\${match.error.message}</p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Back to Directory</a>
                `;
                logger.log('Component rendered error state');
                return;
              }

              // Render with loaded data
              const user = match.data;

              app.innerHTML = `
                <h2 style="margin: 0 0 8px 0;">\${user.name}</h2>
                <div style="margin-bottom: 16px; color: #666;">
                  <p style="margin: 0 0 4px 0;">📧 \${user.email}</p>
                  <p style="margin: 0 0 4px 0;">💼 \${user.role}</p>
                  <p style="margin: 0; font-size: 12px; font-family: monospace;">ID: \${user.id}</p>
                </div>
                <div style="padding: 12px; background: #f5f5f5; margin-bottom: 12px; font-size: 12px;">
                  <strong>Data from loader:</strong><br>
                  <pre style="margin: 8px 0 0 0; font-family: monospace; font-size: 11px;">\${JSON.stringify(user, null, 2)}</pre>
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Directory</a>
              `;

              logger.log(\`Component rendered with data for \${user.name}\`);
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with loader support');
      logger.log('Click a user to see loader → component flow');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
