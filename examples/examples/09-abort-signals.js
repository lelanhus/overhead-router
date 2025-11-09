/**
 * Example 09: Abort Signals
 * Cancelling in-flight requests when navigating away
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Intermediate</span>
      </div>

      <h1 class="example-title">09. Abort Signals</h1>
      <p class="example-description">
        When users navigate quickly, you don't want old requests completing after new ones.
        Abort signals automatically cancel in-flight requests, preventing race conditions and wasted bandwidth.
      </p>

      <h2 class="section-heading">The Problem: Race Conditions</h2>
      <p>
        Without abort signals, rapid navigation can cause race conditions where an older request
        completes after a newer one, showing stale data:
      </p>

      ${createCodeBlock(`
// ❌ BAD: No abort signal
route({
  path: '/users/:userId',
  loader: async ({ params }) => {
    // If user navigates to /users/2 then quickly to /users/3,
    // the /users/2 request might complete AFTER /users/3
    const res = await fetch(\`/api/users/\${params.userId}\`);
    return res.json();  // Could show user 2 data on user 3 page!
  }
})
      `, 'race-condition.js')}\n
      <h2 class="section-heading">The Solution: Abort Signals</h2>
      <p>
        The router provides an <code>AbortSignal</code> in the loader context. Pass it to
        <code>fetch()</code> to enable automatic cancellation:
      </p>

      ${createCodeBlock(`
// ✓ GOOD: With abort signal
route({
  path: '/users/:userId',
  loader: async ({ params, signal }) => {
    // Pass signal to fetch
    const res = await fetch(
      \`/api/users/\${params.userId}\`,
      { signal }  // 👈 This enables cancellation
    );
    return res.json();
  },
  component: (match) => {
    const user = match.data;
    render(\`<h1>\${user.name}</h1>\`);
  }
})

// Now if user navigates to /users/2 then /users/3:
// 1. /users/2 request starts
// 2. Navigation to /users/3 aborts /users/2 request
// 3. /users/3 request starts
// 4. Only /users/3 data is shown ✓
      `, 'abort-signal.js')}\n
      <h2 class="section-heading">How Abort Signals Work</h2>
      <ol>
        <li>Router creates a new <code>AbortController</code> for each navigation</li>
        <li>The controller's <code>signal</code> is passed to your loader</li>
        <li>You pass the signal to <code>fetch()</code> or other abortable operations</li>
        <li>If user navigates away, router calls <code>controller.abort()</code></li>
        <li>The <code>fetch()</code> throws an <code>AbortError</code></li>
        <li>Router catches the error and prevents the component from rendering</li>
      </ol>

      <h2 class="section-heading">Beyond Fetch: Custom Abortable Operations</h2>
      <p>
        You can use abort signals for any async operation, not just <code>fetch()</code>:
      </p>

      ${createCodeBlock(`
route({
  path: '/search',
  loader: async ({ query, signal }) => {
    const searchTerm = query.get('q');

    // Example: Delay with abort support
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 1000);

      // Listen for abort
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

    // Example: WebSocket with abort
    const ws = new WebSocket('wss://api.example.com/search');

    signal.addEventListener('abort', () => {
      ws.close();
    });

    return performSearch(searchTerm, ws);
  }
})
      `, 'custom-abort.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo simulates slow API requests. Click rapidly between users to see abort signals
        cancel old requests, preventing race conditions.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Handling Abort Errors</h2>
      <p>
        When a request is aborted, <code>fetch()</code> throws an <code>AbortError</code>.
        The router catches these automatically, but you can handle them manually if needed:
      </p>

      ${createCodeBlock(`
route({
  path: '/data',
  loader: async ({ signal }) => {
    try {
      const res = await fetch('/api/data', { signal });
      return res.json();
    } catch (error) {
      // Check if error is from abort
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        // Router will handle this automatically
        throw error;
      }

      // Handle other errors
      console.error('Fetch failed:', error);
      throw error;
    }
  }
})
      `, 'error-handling.js')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Always use signals</strong> - Pass signal to all async operations in loaders</li>
        <li><strong>Don't catch AbortError</strong> - Let the router handle abort errors</li>
        <li><strong>Clean up resources</strong> - Use signal listeners to close connections</li>
        <li><strong>Test with slow networks</strong> - Use browser DevTools to simulate slow connections</li>
        <li><strong>Respect the signal</strong> - Check <code>signal.aborted</code> before expensive operations</li>
      </ul>

      ${createCodeBlock(`
// Check signal before expensive operations
route({
  path: '/process',
  loader: async ({ signal }) => {
    const data = await fetch('/api/data', { signal }).then(r => r.json());

    // Check if aborted before processing
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Expensive processing...
    const processed = await processData(data);

    return processed;
  }
})
      `, 'signal-checks.js')}\n
      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered abort signals for clean async operations! Next, we'll explore route guards
        for controlling access to routes with authentication and authorization.
      </p>

      <div class="navigation-controls">
        <a href="/examples/08-data-loaders" class="nav-button">← Previous: Data Loaders</a>
        <a href="/examples/10-route-guards-basic" class="nav-button">Next: Route Guards (Basic) →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Abort Signals Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      const users = {
        '1': { id: 1, name: 'Alice', role: 'Engineer' },
        '2': { id: 2, name: 'Bob', role: 'Designer' },
        '3': { id: 3, name: 'Carol', role: 'Manager' }
      };

      let requestCounter = 0;

      // Simulate slow fetch with abort support
      function slowFetch(userId, signal, delay = 2000) {
        const requestId = ++requestCounter;

        return new Promise((resolve, reject) => {
          logger.log(\`[Request #\${requestId}] Started for user \${userId}\`);

          const timeout = setTimeout(() => {
            const user = users[userId];
            if (user) {
              logger.log(\`[Request #\${requestId}] ✓ Completed for user \${userId}\`);
              resolve(user);
            } else {
              logger.log(\`[Request #\${requestId}] ✗ User not found\`);
              reject(new Error('User not found'));
            }
          }, delay);

          // Handle abort
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            logger.log(\`[Request #\${requestId}] ❌ ABORTED for user \${userId}\`);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 200px;">
          <p style="color: #666;">Click users rapidly to test abort...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Abort Signal Test</h2>
                <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
                  Each request takes 2 seconds. Click rapidly to see old requests abort!
                </p>
                <nav style="display: flex; flex-direction: column; gap: 8px;">
                  ${Object.values(users).map(u => \`
                    <a href="/users/\${u.id}" style="
                      padding: 12px;
                      border: 1px solid #ddd;
                      color: #000;
                      text-decoration: none;
                      background: white;
                    ">
                      → \${u.name} (2 second delay)
                    </a>
                  \`).join('')}
                </nav>
              `;
              logger.log('Ready! Click users rapidly to test abort signals');
            }
          }),

          route({
            path: '/users/:userId',

            loader: async ({ params, signal }) => {
              const { userId } = params;

              app.innerHTML = \`
                <div style="padding: 32px; text-align: center;">
                  <p style="color: #666; margin: 0 0 8px 0;">Loading user \${userId}...</p>
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    (2 second delay - try clicking another user!)
                  </p>
                </div>
              \`;

              try {
                // Pass signal to enable abort
                const user = await slowFetch(userId, signal, 2000);
                return user;
              } catch (error) {
                if (error.name === 'AbortError') {
                  // Let router handle abort
                  throw error;
                }
                throw new Error(\`Failed to load user: \${error.message}\`);
              }
            },

            component: (match) => {
              if (match.error) {
                // Only show error if it's not an abort
                if (match.error.name !== 'AbortError') {
                  app.innerHTML = \`
                    <h2 style="color: #d00;">Error</h2>
                    <p>\${match.error.message}</p>
                    <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
                  \`;
                }
                return;
              }

              const user = match.data;

              app.innerHTML = \`
                <h2 style="margin: 0 0 12px 0;">\${user.name}</h2>
                <p style="margin: 0 0 16px 0; color: #666;">\${user.role}</p>
                <div style="padding: 12px; background: #f5f5f5; margin-bottom: 12px; font-size: 12px;">
                  ✓ Request completed successfully (not aborted)
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to List</a>
              \`;

              logger.log(\`✓ Rendered user: \${user.name}\`);
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with abort signal support');
      logger.log('Requests take 2 seconds - click rapidly to test!');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
