/**
 * Example 19: Error Handling
 * NavigationError types, recovery patterns, and graceful degradation
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Expert</span>
      </div>

      <h1 class="example-title">19. Error Handling</h1>
      <p class="example-description">
        Handle navigation failures gracefully with proper error boundaries, fallback UI,
        and recovery mechanisms. Make your app resilient to network failures and edge cases.
      </p>

      <h2 class="section-heading">Types of Navigation Errors</h2>
      <p>
        The router can encounter several types of errors during navigation:
      </p>

      <ul>
        <li><strong>Loader errors</strong> - Data fetch failures, network issues</li>
        <li><strong>Guard errors</strong> - Permission checks that throw</li>
        <li><strong>Component errors</strong> - Runtime errors in rendering</li>
        <li><strong>Abort errors</strong> - Cancelled requests (handled automatically)</li>
        <li><strong>Not found</strong> - No matching route</li>
      </ul>

      ${createCodeBlock(`
// Loader error
route({
  path: '/products/:id',
  loader: async ({ params }) => {
    const res = await fetch(\`/api/products/\${params.id}\`);

    if (!res.ok) {
      throw new Error('Product not found');
    }

    return res.json();
  },
  component: (match) => {
    // Check for errors
    if (match.error) {
      return render(\`
        <h1>Error Loading Product</h1>
        <p>\${match.error.message}</p>
        <button onclick="retry()">Retry</button>
      \`);
    }

    // Success path
    render(\`<h1>\${match.data.name}</h1>\`);
  }
})
      `, 'loader-errors.js')}\n
      <h2 class="section-heading">Error Boundaries</h2>
      <p>
        Create centralized error handling with error boundaries:
      </p>

      ${createCodeBlock(`
const router = createRouter({
  routes: [/* ... */],

  // Global error handler
  onError: (error, match) => {
    console.error('Navigation error:', error);

    // Log to error tracking service
    trackError({
      path: match?.path,
      error: error.message,
      stack: error.stack
    });

    // Render error page
    render(\`
      <div class="error-boundary">
        <h1>Something went wrong</h1>
        <p>\${error.message}</p>
        <button onclick="router.navigate('/')">Go Home</button>
      </div>
    \`);
  }
});
      `, 'error-boundary.js')}\n
      <h2 class="section-heading">Retry Logic</h2>
      <p>
        Implement retry mechanisms for transient failures:
      </p>

      ${createCodeBlock(`
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok && response.status >= 500) {
        throw new Error(\`Server error: \${response.status}\`);
      }

      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait before retry (exponential backoff)
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}

route({
  path: '/data',
  loader: async ({ signal }) => {
    const response = await fetchWithRetry('/api/data', { signal });
    return response.json();
  }
})
      `, 'retry-logic.js')}\n
      <h2 class="section-heading">Fallback UI</h2>
      <p>
        Show graceful fallbacks when data fails to load:
      </p>

      ${createCodeBlock(`
route({
  path: '/users/:userId',
  loader: async ({ params, signal }) => {
    try {
      const res = await fetch(\`/api/users/\${params.userId}\`, { signal });

      if (!res.ok) {
        throw new Error('User not found');
      }

      return res.json();
    } catch (error) {
      // Return fallback data instead of throwing
      return {
        id: params.userId,
        name: 'Unknown User',
        error: true,
        errorMessage: error.message
      };
    }
  },
  component: (match) => {
    const user = match.data;

    if (user.error) {
      render(\`
        <div class="fallback-ui">
          <h1>\${user.name}</h1>
          <p class="error-message">
            ⚠️ Could not load full profile: \${user.errorMessage}
          </p>
          <button onclick="location.reload()">Retry</button>
        </div>
      \`);
    } else {
      render(\`
        <h1>\${user.name}</h1>
        <p>\${user.email}</p>
      \`);
    }
  }
})
      `, 'fallback-ui.js')}\n
      <h2 class="section-heading">Network Error Handling</h2>
      <p>
        Detect and handle network-specific errors:
      </p>

      ${createCodeBlock(`
route({
  path: '/data',
  loader: async ({ signal }) => {
    try {
      const res = await fetch('/api/data', { signal });
      return res.json();
    } catch (error) {
      // Check error type
      if (error.name === 'AbortError') {
        // Navigation was cancelled - don't show error
        throw error;
      }

      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      if (error.name === 'TypeError') {
        throw new Error('Network request failed');
      }

      throw error;
    }
  },
  component: (match) => {
    if (match.error) {
      const isOffline = !navigator.onLine;

      render(\`
        <div class="error-page">
          <h1>\${isOffline ? '📡 Offline' : '⚠️ Error'}</h1>
          <p>\${match.error.message}</p>
          \${isOffline
            ? '<p>Check your internet connection</p>'
            : '<button onclick="retry()">Retry</button>'
          }
        </div>
      \`);
    }
  }
})
      `, 'network-errors.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo simulates various error scenarios. Click routes to see different
        error handling strategies in action.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Error Recovery Patterns</h2>
      <ul>
        <li><strong>Retry button</strong> - Let users retry failed operations</li>
        <li><strong>Offline detection</strong> - Show specific messaging for network issues</li>
        <li><strong>Fallback content</strong> - Show partial data instead of failing completely</li>
        <li><strong>Error tracking</strong> - Log errors for debugging and monitoring</li>
        <li><strong>Graceful degradation</strong> - Remove features that depend on failed data</li>
        <li><strong>Recovery hints</strong> - Provide actionable suggestions to users</li>
      </ul>

      <h2 class="section-heading">Error Logging</h2>
      <p>
        Integrate with error tracking services:
      </p>

      ${createCodeBlock(`
import * as Sentry from '@sentry/browser';

const router = createRouter({
  routes: [/* ... */],

  onError: (error, match) => {
    // Filter out abort errors
    if (error.name === 'AbortError') return;

    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        route: match?.path,
        type: 'navigation-error'
      },
      extra: {
        params: match?.params,
        query: match?.query.toString()
      }
    });

    // Show user-friendly error
    renderErrorPage(error);
  }
});
      `, 'error-tracking.js')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Never show stack traces</strong> - Display user-friendly messages</li>
        <li><strong>Provide context</strong> - Explain what went wrong and why</li>
        <li><strong>Offer recovery</strong> - Always give users a way forward</li>
        <li><strong>Log errors</strong> - Track failures for debugging</li>
        <li><strong>Test error states</strong> - Regularly test error handling</li>
        <li><strong>Graceful degradation</strong> - Prefer partial functionality over complete failure</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered error handling! Now for the final example: we'll put everything
        together in a full application pattern with auth, nested routes, and data loading.
      </p>

      <div class="navigation-controls">
        <a href="/examples/18-active-link-styling" class="nav-button">← Previous: Active Link Styling</a>
        <a href="/examples/20-full-app-pattern" class="nav-button">Next: Full App Pattern →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Error Handling Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      let simulateOffline = false;

      function simulateNetworkError() {
        if (simulateOffline) {
          return Promise.reject(new Error('Network request failed'));
        }
        return Promise.reject(new Error('Server returned 500'));
      }

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 240px;">
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
                <h2 style="margin: 0 0 16px 0;">Error Handling Scenarios</h2>
                <div style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="offline-toggle" ${simulateOffline ? 'checked' : ''}>
                    Simulate offline mode
                  </label>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/success" style="color: #000; text-decoration: underline;">
                    ✓ Success (no error)
                  </a>
                  <a href="/loader-error" style="color: #000; text-decoration: underline;">
                    ❌ Loader Error (fetch failure)
                  </a>
                  <a href="/not-found" style="color: #000; text-decoration: underline;">
                    🔍 Not Found (404)
                  </a>
                  <a href="/fallback-data" style="color: #000; text-decoration: underline;">
                    ⚠️ Fallback UI (partial data)
                  </a>
                </div>
              `;

              app.querySelector('#offline-toggle').addEventListener('change', (e) => {
                simulateOffline = e.target.checked;
                logger.log(`Offline mode: ${simulateOffline ? 'ON' : 'OFF'}`);
              });
            }
          }),

          route({
            path: '/success',
            loader: async () => {
              logger.log('Loading data...');
              await new Promise(resolve => setTimeout(resolve, 300));
              return { message: 'Data loaded successfully!' };
            },
            component: (match) => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Success</h2>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ ${match.data.message}
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log('✓ Data loaded successfully');
            }
          }),

          route({
            path: '/loader-error',
            loader: async () => {
              logger.log('Attempting to load data...');
              await new Promise(resolve => setTimeout(resolve, 500));
              await simulateNetworkError();
            },
            component: (match) => {
              if (match.error) {
                app.innerHTML = `
                  <h2 style="margin: 0 0 12px 0; color: #d00;">Error Loading Data</h2>
                  <div style="padding: 12px; background: #ffebee; margin-bottom: 12px; border: 1px solid #d00;">
                    ❌ ${match.error.message}
                  </div>
                  <p style="margin: 0 0 12px 0; color: #666;">
                    ${simulateOffline
                      ? '📡 Check your internet connection'
                      : 'The server encountered an error'
                    }
                  </p>
                  <button
                    onclick="window.location.reload()"
                    style="padding: 8px 16px; border: 1px solid #000; background: white; cursor: pointer; margin-right: 8px;"
                  >
                    Retry
                  </button>
                  <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
                `;
                logger.log(`❌ Loader error: ${match.error.message}`);
              }
            }
          }),

          route({
            path: '/fallback-data',
            loader: async () => {
              logger.log('Attempting to load user profile...');
              await new Promise(resolve => setTimeout(resolve, 500));

              try {
                await simulateNetworkError();
              } catch (error) {
                logger.log('⚠️ Fetch failed, returning fallback data');
                return {
                  name: 'Guest User',
                  email: 'Not available',
                  error: true,
                  errorMessage: error.message
                };
              }
            },
            component: (match) => {
              const user = match.data;

              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">${user.name}</h2>
                ${user.error ? `
                  <div style="padding: 12px; background: #fff3e0; margin-bottom: 12px; border: 1px solid #ff9800;">
                    ⚠️ Could not load full profile: ${user.errorMessage}
                  </div>
                ` : ''}
                <p style="margin: 0 0 12px 0;">Email: ${user.email}</p>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">
                  This page uses fallback data when the API fails, providing a degraded but functional experience.
                </p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log('Rendered with fallback data (graceful degradation)');
            }
          })
        ],

        notFound: () => {
          app.innerHTML = `
            <h2 style="margin: 0 0 12px 0; color: #d00;">404: Page Not Found</h2>
            <p style="margin: 0 0 12px 0;">The requested page does not exist.</p>
            <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
          `;
          logger.log('404: Route not found');
        },

        ssr: true
      });

      logger.log('Router initialized with error handling');
      logger.log('Try different error scenarios');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
