/**
 * Example 10: Route Guards (Basic)
 * Boolean allow/deny for access control
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Intermediate</span>
      </div>

      <h1 class="example-title">10. Route Guards (Basic)</h1>
      <p class="example-description">
        Route guards control access to routes. Use them for authentication, authorization,
        feature flags, or any condition that determines if a user can access a page.
      </p>

      <h2 class="section-heading">What are Route Guards?</h2>
      <p>
        A guard is a function that runs before the loader and component. It returns <code>true</code>
        to allow access or <code>false</code> to deny it.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/admin',

      // Guard: Check if user is admin
      guard: () => {
        const user = getCurrentUser();
        return user?.role === 'admin';  // true = allow, false = deny
      },

      // Component: Only runs if guard returns true
      component: () => {
        render('<h1>Admin Dashboard</h1>');
      }
    })
  ]
});

function getCurrentUser() {
  // Your auth logic here
  return { id: 1, role: 'admin' };
}
      `, 'basic-guard.js')}\n
      <h2 class="section-heading">Guard Execution Order</h2>
      <p>
        Guards run first, before loaders and components. This prevents unnecessary data fetching
        for unauthorized users:
      </p>

      <ol>
        <li><strong>Route matches</strong> - Router finds matching route</li>
        <li><strong>Guard runs</strong> - Check access control</li>
        <li>If guard returns <code>false</code>: Stop here, show unauthorized page</li>
        <li>If guard returns <code>true</code>: Continue to loader</li>
        <li><strong>Loader runs</strong> - Fetch data (only if allowed)</li>
        <li><strong>Component runs</strong> - Render page (only if allowed)</li>
      </ol>

      ${createCodeBlock(`
route({
  path: '/dashboard',

  guard: () => {
    console.log('1. Guard runs first');
    return isAuthenticated();
  },

  loader: async () => {
    console.log('2. Loader runs only if guard allows');
    return fetchUserData();
  },

  component: (match) => {
    console.log('3. Component runs only if guard allows');
    render(\`<h1>Welcome, \${match.data.name}</h1>\`);
  }
})
      `, 'execution-order.js')}\n
      <h2 class="section-heading">Common Guard Patterns</h2>
      <p>
        Guards are perfect for various access control scenarios:
      </p>

      ${createCodeBlock(`
// Authentication guard
route({
  path: '/profile',
  guard: () => {
    return isLoggedIn();
  }
})

// Role-based authorization
route({
  path: '/admin',
  guard: () => {
    const user = getCurrentUser();
    return user?.role === 'admin';
  }
})

// Feature flag
route({
  path: '/beta-feature',
  guard: () => {
    return hasFeatureFlag('beta-access');
  }
})

// Permission check
route({
  path: '/users/:userId/edit',
  guard: (params) => {
    const currentUser = getCurrentUser();
    return currentUser.id === params.userId || currentUser.isAdmin;
  }
})

// Subscription check
route({
  path: '/premium-content',
  guard: () => {
    const user = getCurrentUser();
    return user?.subscription === 'premium';
  }
})
      `, 'guard-patterns.js')}\n
      <h2 class="section-heading">Accessing Route Parameters</h2>
      <p>
        Guards receive route parameters, letting you make decisions based on the URL:
      </p>

      ${createCodeBlock(`
route({
  path: '/users/:userId/settings',

  // Guard receives params
  guard: (params) => {
    const currentUser = getCurrentUser();

    // Users can only access their own settings
    return currentUser.id === params.userId;
  },

  component: (match) => {
    render('<h1>User Settings</h1>');
  }
})
      `, 'guard-params.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows protected routes with authentication. Toggle the "logged in" state
        and try accessing protected pages.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Handling Denied Access</h2>
      <p>
        When a guard returns <code>false</code>, the router triggers the <code>unauthorized</code>
        callback (if configured). You can customize the unauthorized page:
      </p>

      ${createCodeBlock(`
const router = createRouter({
  routes: [
    route({
      path: '/admin',
      guard: () => isAdmin(),
      component: () => render('<h1>Admin Panel</h1>')
    })
  ],

  // Custom unauthorized handler
  unauthorized: () => {
    render(\`
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <a href="/login">Login</a>
    \`);
  }
});
      `, 'unauthorized-handler.js')}\n
      <h2 class="section-heading">Async Guards</h2>
      <p>
        Guards can be async if you need to check permissions with an API call:
      </p>

      ${createCodeBlock(`
route({
  path: '/protected',
  guard: async () => {
    // Check permission with API
    const response = await fetch('/api/check-permission');
    const { allowed } = await response.json();
    return allowed;
  }
})
      `, 'async-guard.js')}\n
      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered intermediate routing concepts! You can now handle data loading,
        abort signals, and basic guards. Next, we'll explore advanced topics starting with
        enhanced guards that support redirects and context passing.
      </p>

      <div class="navigation-controls">
        <a href="/examples/09-abort-signals" class="nav-button">← Previous: Abort Signals</a>
        <a href="/examples/11-enhanced-guards" class="nav-button">Next: Enhanced Guards →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Route Guards Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Simulated auth state
      let isLoggedIn = false;
      let userRole = 'user'; // 'user' or 'admin'

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
                <h2 style="margin: 0 0 16px 0;">Route Guards Demo</h2>

                <div style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                  <p style="margin: 0 0 8px 0;"><strong>Auth Status:</strong></p>
                  <p style="margin: 0 0 8px 0;">
                    Logged in: <strong>${isLoggedIn ? 'Yes' : 'No'}</strong>
                    ${isLoggedIn ? `(Role: ${userRole})` : ''}
                  </p>
                  <button id="toggle-auth" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer; margin-right: 8px;">
                    ${isLoggedIn ? 'Logout' : 'Login as User'}
                  </button>
                  ${isLoggedIn && userRole === 'user' ? `
                    <button id="toggle-admin" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer;">
                      Switch to Admin
                    </button>
                  ` : ''}
                  ${isLoggedIn && userRole === 'admin' ? `
                    <button id="toggle-admin" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer;">
                      Switch to User
                    </button>
                  ` : ''}
                </div>

                <nav style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/public" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none; background: white;">
                    → Public Page (no guard)
                  </a>
                  <a href="/dashboard" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none; background: white;">
                    → Dashboard (requires login)
                  </a>
                  <a href="/admin" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none; background: white;">
                    → Admin Panel (requires admin role)
                  </a>
                </nav>
              `;

              // Add event listeners
              app.querySelector('#toggle-auth')?.addEventListener('click', () => {
                isLoggedIn = !isLoggedIn;
                if (!isLoggedIn) {
                  userRole = 'user';
                }
                logger.log(`Auth toggled: ${isLoggedIn ? 'logged in' : 'logged out'}`);
                router.navigate('/');
              });

              app.querySelector('#toggle-admin')?.addEventListener('click', () => {
                userRole = userRole === 'admin' ? 'user' : 'admin';
                logger.log(`Role switched to: ${userRole}`);
                router.navigate('/');
              });

              logger.log('Home page rendered');
            }
          }),

          route({
            path: '/public',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Public Page</h2>
                <p style="margin: 0 0 12px 0;">This page has no guard. Anyone can access it!</p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Public page: No guard, access allowed');
            }
          }),

          route({
            path: '/dashboard',
            guard: () => {
              logger.log(`Dashboard guard check: isLoggedIn=${isLoggedIn}`);
              return isLoggedIn;
            },
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Dashboard</h2>
                <p style="margin: 0 0 12px 0;">Welcome! You are logged in as: <strong>${userRole}</strong></p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Guard allowed access (isLoggedIn === true)
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Dashboard: Guard passed, rendered component');
            }
          }),

          route({
            path: '/admin',
            guard: () => {
              logger.log(`Admin guard check: isLoggedIn=${isLoggedIn}, role=${userRole}`);
              return isLoggedIn && userRole === 'admin';
            },
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Admin Panel</h2>
                <p style="margin: 0 0 12px 0;">Welcome, Administrator! You have full access.</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Guard allowed access (isLoggedIn && role === 'admin')
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Admin: Guard passed, rendered component');
            }
          })
        ],

        // Handle unauthorized access
        unauthorized: () => {
          app.innerHTML = `
            <h2 style="margin: 0 0 12px 0; color: #d00;">Access Denied</h2>
            <p style="margin: 0 0 12px 0;">
              You don't have permission to access this page.
            </p>
            <div style="padding: 12px; background: #ffebee; margin-bottom: 12px;">
              ❌ Guard denied access (returned false)
            </div>
            <p style="margin: 0 0 12px 0; color: #666;">
              Try logging in or switching to admin role.
            </p>
            <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
          `;
          logger.log('❌ Unauthorized: Guard returned false');
        },

        ssr: true
      });

      logger.log('Router initialized with guard protection');
      logger.log('Try accessing protected routes with different auth states');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
