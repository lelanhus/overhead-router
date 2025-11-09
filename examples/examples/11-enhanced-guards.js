/**
 * Example 11: Enhanced Guards
 * Redirect, deny with reason, and context passing
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Advanced</span>
      </div>

      <h1 class="example-title">11. Enhanced Guards</h1>
      <p class="example-description">
        Beyond simple true/false, guards can redirect users, deny with custom reasons,
        and pass context to loaders. This unlocks powerful authentication and authorization patterns.
      </p>

      <h2 class="section-heading">Guard Result Types</h2>
      <p>
        Enhanced guards return an object instead of just a boolean. The object describes
        what action to take:
      </p>

      ${createCodeBlock(`
type GuardResult =
  // Allow access
  | { allow: true; context?: unknown }
  // Deny access with reason
  | { deny: true; reason?: string }
  // Redirect to another route
  | { redirect: string; replace?: boolean }
  // Simple boolean (still supported)
  | boolean;
      `, 'guard-types.ts')}\n
      <h2 class="section-heading">Redirecting Users</h2>
      <p>
        Instead of showing an unauthorized page, redirect users to login or another route:
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/dashboard',

      // Redirect to login if not authenticated
      guard: () => {
        const isLoggedIn = checkAuth();

        if (!isLoggedIn) {
          return {
            redirect: '/login',
            replace: true  // Replace history entry (optional)
          };
        }

        return { allow: true };
      },

      component: () => {
        render('<h1>Dashboard</h1>');
      }
    }),

    route({
      path: '/login',
      component: () => {
        render(\`
          <h1>Login</h1>
          <button onclick="login()">Login</button>
        \`);
      }
    })
  ]
});
      `, 'redirect-guard.js')}\n
      <h2 class="section-heading">Deny with Reason</h2>
      <p>
        Provide a custom message explaining why access was denied:
      </p>

      ${createCodeBlock(`
route({
  path: '/premium-content',
  guard: () => {
    const user = getCurrentUser();

    if (!user) {
      return {
        redirect: '/login'
      };
    }

    if (user.subscription !== 'premium') {
      return {
        deny: true,
        reason: 'Premium subscription required to access this content.'
      };
    }

    return { allow: true };
  },

  component: () => {
    render('<h1>Premium Content</h1>');
  }
})

// Access the deny reason in unauthorized handler
unauthorized: (error) => {
  render(\`
    <h1>Access Denied</h1>
    <p>\${error.reason || 'You do not have permission.'}</p>
  \`);
}
      `, 'deny-reason.js')}\n
      <h2 class="section-heading">Passing Context to Loaders</h2>
      <p>
        Guards can pass data to loaders via the <code>context</code> field. This is perfect
        for sharing authentication tokens, user info, or permissions:
      </p>

      ${createCodeBlock(`
route({
  path: '/profile',

  // Guard: Authenticate and pass user data to loader
  guard: async () => {
    const token = getAuthToken();

    if (!token) {
      return { redirect: '/login' };
    }

    // Verify token and get user
    const user = await verifyToken(token);

    if (!user) {
      return { redirect: '/login' };
    }

    // Pass user to loader via context
    return {
      allow: true,
      context: { user, token }
    };
  },

  // Loader: Receive context from guard
  loader: async ({ context, signal }) => {
    const { user, token } = context;

    // Use user data from guard
    const response = await fetch(\`/api/users/\${user.id}/profile\`, {
      headers: { Authorization: \`Bearer \${token}\` },
      signal
    });

    return response.json();
  },

  component: (match) => {
    const profile = match.data;
    render(\`<h1>Profile: \${profile.name}</h1>\`);
  }
})
      `, 'context-passing.js')}\n
      <h2 class="section-heading">Complex Guard Logic</h2>
      <p>
        Combine all guard features for sophisticated access control:
      </p>

      ${createCodeBlock(`
route({
  path: '/admin/users/:userId/edit',

  guard: async (params) => {
    // 1. Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { redirect: '/login' };
    }

    // 2. Check role
    if (currentUser.role !== 'admin') {
      return {
        deny: true,
        reason: 'Only administrators can edit users.'
      };
    }

    // 3. Check specific permission
    const canEdit = await checkPermission(currentUser.id, 'edit-users');
    if (!canEdit) {
      return {
        deny: true,
        reason: 'You do not have permission to edit users.'
      };
    }

    // 4. Pass admin data to loader
    return {
      allow: true,
      context: { admin: currentUser }
    };
  },

  loader: async ({ params, context, signal }) => {
    // Use admin from guard context
    const { admin } = context;

    // Fetch user to edit
    const response = await fetch(
      \`/api/admin/users/\${params.userId}\`,
      {
        headers: { 'X-Admin-ID': admin.id },
        signal
      }
    );

    return response.json();
  }
})
      `, 'complex-guard.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows all guard result types in action. Try different auth states
        and see redirects, denials, and context passing.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Guard Result Priority</h2>
      <p>
        When guards return objects, here's how the router handles them:
      </p>
      <ul>
        <li><strong>redirect</strong> - Immediate navigation to new route (highest priority)</li>
        <li><strong>deny</strong> - Calls unauthorized handler with reason</li>
        <li><strong>allow</strong> - Continues to loader, passes context if provided</li>
        <li><strong>true/false</strong> - Simple allow/deny (backward compatible)</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered advanced guard patterns! Next, we'll explore nested routes
        for creating layouts with child routes.
      </p>

      <div class="navigation-controls">
        <a href="/examples/10-route-guards-basic" class="nav-button">← Previous: Route Guards (Basic)</a>
        <a href="/examples/12-nested-routes" class="nav-button">Next: Nested Routes →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Enhanced Guards Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Simulated auth state
      let auth = {
        isLoggedIn: false,
        role: 'user', // 'user', 'premium', or 'admin'
        username: ''
      };

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
                <h2 style="margin: 0 0 16px 0;">Enhanced Guards Demo</h2>

                <div style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; border: 1px solid #ddd;">
                  <p style="margin: 0 0 8px 0;"><strong>Auth Status:</strong></p>
                  <p style="margin: 0 0 8px 0;">
                    ${auth.isLoggedIn
                      ? \`Logged in as <strong>\${auth.username}</strong> (Role: \${auth.role})\`
                      : '<strong>Not logged in</strong>'}
                  </p>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${!auth.isLoggedIn ? \`
                      <button id="login-user" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer;">
                        Login as User
                      </button>
                      <button id="login-premium" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer;">
                        Login as Premium
                      </button>
                      <button id="login-admin" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer;">
                        Login as Admin
                      </button>
                    \` : \`
                      <button id="logout" style="padding: 6px 12px; border: 1px solid #000; background: white; cursor: pointer;">
                        Logout
                      </button>
                    \`}
                  </div>
                </div>

                <nav style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/basic" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none;">
                    → Basic Page (guard: simple boolean)
                  </a>
                  <a href="/dashboard" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none;">
                    → Dashboard (guard: redirect if not logged in)
                  </a>
                  <a href="/premium" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none;">
                    → Premium Content (guard: deny with reason)
                  </a>
                  <a href="/admin" style="padding: 12px; border: 1px solid #ddd; color: #000; text-decoration: none;">
                    → Admin Panel (guard: context passing)
                  </a>
                </nav>
              `;

              // Add event listeners
              app.querySelector('#login-user')?.addEventListener('click', () => {
                auth = { isLoggedIn: true, role: 'user', username: 'Alice' };
                logger.log('Logged in as User (Alice)');
                router.navigate('/');
              });

              app.querySelector('#login-premium')?.addEventListener('click', () => {
                auth = { isLoggedIn: true, role: 'premium', username: 'Bob' };
                logger.log('Logged in as Premium user (Bob)');
                router.navigate('/');
              });

              app.querySelector('#login-admin')?.addEventListener('click', () => {
                auth = { isLoggedIn: true, role: 'admin', username: 'Carol' };
                logger.log('Logged in as Admin (Carol)');
                router.navigate('/');
              });

              app.querySelector('#logout')?.addEventListener('click', () => {
                auth = { isLoggedIn: false, role: 'user', username: '' };
                logger.log('Logged out');
                router.navigate('/');
              });
            }
          }),

          // Simple boolean guard (backward compatible)
          route({
            path: '/basic',
            guard: () => {
              logger.log('Basic guard: returning boolean');
              return auth.isLoggedIn;
            },
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Basic Guard Example</h2>
                <p style="margin: 0 0 12px 0;">This route uses a simple boolean guard.</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Guard returned true
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
              logger.log('Basic: Guard passed (boolean true)');
            }
          }),

          // Redirect guard
          route({
            path: '/dashboard',
            guard: () => {
              if (!auth.isLoggedIn) {
                logger.log('Dashboard guard: Redirecting to /login');
                return { redirect: '/login' };
              }
              logger.log('Dashboard guard: Allowing access');
              return { allow: true };
            },
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Dashboard</h2>
                <p style="margin: 0 0 12px 0;">Welcome, ${auth.username}!</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Guard returned { allow: true }
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
            }
          }),

          // Deny with reason
          route({
            path: '/premium',
            guard: () => {
              if (!auth.isLoggedIn) {
                logger.log('Premium guard: Redirecting to /login');
                return { redirect: '/login' };
              }

              if (auth.role !== 'premium' && auth.role !== 'admin') {
                logger.log('Premium guard: Denying with reason');
                return {
                  deny: true,
                  reason: 'Premium subscription required. Upgrade your account to access this content.'
                };
              }

              logger.log('Premium guard: Allowing access');
              return { allow: true };
            },
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Premium Content</h2>
                <p style="margin: 0 0 12px 0;">Exclusive content for premium members!</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px;">
                  ✓ Guard returned { allow: true }
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
            }
          }),

          // Context passing
          route({
            path: '/admin',
            guard: () => {
              if (!auth.isLoggedIn) {
                logger.log('Admin guard: Redirecting to /login');
                return { redirect: '/login' };
              }

              if (auth.role !== 'admin') {
                logger.log('Admin guard: Denying with reason');
                return {
                  deny: true,
                  reason: 'Administrator access required.'
                };
              }

              logger.log('Admin guard: Allowing with context');
              return {
                allow: true,
                context: { admin: auth }
              };
            },
            loader: async ({ context }) => {
              const { admin } = context || {};
              logger.log(\`Loader received context: admin=\${admin?.username}\`);

              // Simulate fetching admin-specific data
              return {
                stats: {
                  users: 1247,
                  revenue: '$54,320',
                  activeSessions: 89
                }
              };
            },
            component: (match) => {
              const { stats } = match.data;
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Admin Panel</h2>
                <p style="margin: 0 0 12px 0;">Welcome, Administrator ${auth.username}!</p>
                <div style="padding: 12px; background: #e8f5e9; margin-bottom: 12px; font-size: 13px;">
                  ✓ Guard returned { allow: true, context: { admin } }<br>
                  ✓ Loader received context from guard
                </div>
                <div style="padding: 12px; background: #f5f5f5; margin-bottom: 12px;">
                  <strong>Dashboard Stats:</strong><br>
                  Users: ${stats.users}<br>
                  Revenue: ${stats.revenue}<br>
                  Active Sessions: ${stats.activeSessions}
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back</a>
              `;
            }
          }),

          // Login page
          route({
            path: '/login',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Please Login</h2>
                <p style="margin: 0 0 16px 0;">
                  You were redirected here because you're not logged in.
                </p>
                <div style="padding: 12px; background: #fff3e0; margin-bottom: 16px; border: 1px solid #ff9800;">
                  ℹ️ Guard returned { redirect: '/login' }
                </div>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Redirected to login page');
            }
          })
        ],

        unauthorized: (error) => {
          const reason = error?.reason || 'You do not have permission to access this page.';
          app.innerHTML = `
            <h2 style="margin: 0 0 12px 0; color: #d00;">Access Denied</h2>
            <p style="margin: 0 0 16px 0;">${reason}</p>
            <div style="padding: 12px; background: #ffebee; margin-bottom: 16px; border: 1px solid #d00;">
              ❌ Guard returned { deny: true, reason: "..." }
            </div>
            <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
          `;
          logger.log(\`Unauthorized: \${reason}\`);
        },

        ssr: true
      });

      logger.log('Router initialized with enhanced guards');
      logger.log('Try different auth states and visit protected routes');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
