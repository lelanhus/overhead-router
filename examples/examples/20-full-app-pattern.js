/**
 * Example 20: Full App Pattern
 * Complete application combining auth guards, nested layouts, data loading, and all concepts
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Expert</span>
      </div>

      <h1 class="example-title">20. Full App Pattern</h1>
      <p class="example-description">
        Congratulations! You've learned all the fundamentals. This final example combines
        everything into a complete application pattern with authentication, nested routes,
        data loading, caching, and error handling.
      </p>

      <h2 class="section-heading">The Complete Pattern</h2>
      <p>
        A production-ready router setup includes:
      </p>

      <ul>
        <li><strong>Authentication</strong> - Guards for protected routes</li>
        <li><strong>Nested layouts</strong> - Persistent navigation and chrome</li>
        <li><strong>Data loaders</strong> - Async data fetching with caching</li>
        <li><strong>Error boundaries</strong> - Graceful error handling</li>
        <li><strong>Route metadata</strong> - Breadcrumbs, titles, analytics</li>
        <li><strong>Active nav</strong> - Visual feedback for current page</li>
        <li><strong>Subscriptions</strong> - Global navigation handlers</li>
      </ul>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

// Auth utility
const auth = {
  isLoggedIn: () => !!localStorage.getItem('token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'fake-token');
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

const router = createRouter({
  routes: [
    // Public routes
    route({
      path: '/',
      meta: { title: 'Home' },
      component: () => render('<h1>Welcome</h1>')
    }),

    route({
      path: '/login',
      meta: { title: 'Login' },
      component: () => renderLoginForm()
    }),

    // Protected app shell
    route({
      path: '/app',
      guard: () => {
        if (!auth.isLoggedIn()) {
          return { redirect: '/login' };
        }
        return {
          allow: true,
          context: { user: auth.getUser() }
        };
      },
      component: () => renderAppShell(),
      children: [
        route({
          path: '/',
          meta: { title: 'Dashboard' },
          loader: ({ context, signal }) => fetchDashboard(context.user, signal),
          component: (match) => renderDashboard(match.data)
        }),

        route({
          path: '/profile',
          meta: { title: 'Profile' },
          loader: ({ context, signal }) => fetchProfile(context.user, signal),
          component: (match) => renderProfile(match.data)
        }),

        route({
          path: '/settings',
          meta: { title: 'Settings' },
          component: () => renderSettings()
        })
      ]
    })
  ],

  cache: {
    strategy: 'params',
    maxSize: 20,
    maxAge: 5 * 60 * 1000  // 5 minutes
  },

  unauthorized: () => {
    render(\`
      <h1>Access Denied</h1>
      <a href="/login">Please login</a>
    \`);
  },

  notFound: () => {
    render('<h1>404: Page Not Found</h1>');
  }
});

// Global navigation tracking
router.subscribe((match) => {
  // Update title
  document.title = \`\${match.meta?.title || 'App'} | My App\`;

  // Analytics
  trackPageView(match.path);

  // Scroll to top
  window.scrollTo(0, 0);
});
      `, 'full-app.js')}\n
      <h2 class="section-heading">App Shell Pattern</h2>
      <p>
        The app shell provides persistent navigation and layout for authenticated routes:
      </p>

      ${createCodeBlock(`
function renderAppShell() {
  const user = auth.getUser();

  return \`
    <div class="app-shell">
      <header class="app-header">
        <h1>My App</h1>
        <div class="user-menu">
          <span>\${user.name}</span>
          <button onclick="handleLogout()">Logout</button>
        </div>
      </header>

      <div class="app-body">
        <aside class="app-sidebar">
          <nav>
            <a href="/app">Dashboard</a>
            <a href="/app/profile">Profile</a>
            <a href="/app/settings">Settings</a>
          </nav>
        </aside>

        <main id="app-content" class="app-content">
          <!-- Child routes render here -->
        </main>
      </div>
    </div>
  \`;
}

function handleLogout() {
  auth.logout();
  router.navigate('/');
}
      `, 'app-shell.js')}\n
      <h2 class="section-heading">Data Loading Strategy</h2>
      <p>
        Use loaders with context from guards for authenticated data fetching:
      </p>

      ${createCodeBlock(`
route({
  path: '/app/dashboard',

  // Guard passes user context to loader
  guard: () => {
    const user = auth.getUser();
    if (!user) return { redirect: '/login' };

    return {
      allow: true,
      context: { user, token: localStorage.getItem('token') }
    };
  },

  // Loader receives context from guard
  loader: async ({ context, signal }) => {
    const { user, token } = context;

    const [stats, activity] = await Promise.all([
      fetch(\`/api/users/\${user.id}/stats\`, {
        headers: { Authorization: \`Bearer \${token}\` },
        signal
      }).then(r => r.json()),

      fetch(\`/api/users/\${user.id}/activity\`, {
        headers: { Authorization: \`Bearer \${token}\` },
        signal
      }).then(r => r.json())
    ]);

    return { stats, activity };
  },

  // Component receives data from loader
  component: (match) => {
    if (match.error) {
      return renderError(match.error);
    }

    const { stats, activity } = match.data;
    return renderDashboard(stats, activity);
  }
})
      `, 'data-loading.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a complete mini-application with authentication, protected routes,
        nested layouts, and data loading. Try logging in and exploring!
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Production Checklist</h2>
      <ul>
        <li>✓ <strong>Authentication guards</strong> - Protect routes, redirect unauthorized users</li>
        <li>✓ <strong>Nested routes</strong> - App shell with persistent navigation</li>
        <li>✓ <strong>Data loaders</strong> - Fetch data before rendering</li>
        <li>✓ <strong>Abort signals</strong> - Cancel in-flight requests</li>
        <li>✓ <strong>Cache strategy</strong> - Optimize performance with caching</li>
        <li>✓ <strong>Error handling</strong> - Graceful fallbacks and recovery</li>
        <li>✓ <strong>Route metadata</strong> - Titles, breadcrumbs, analytics</li>
        <li>✓ <strong>Active links</strong> - Visual feedback for navigation</li>
        <li>✓ <strong>Subscriptions</strong> - Global navigation handlers</li>
        <li>✓ <strong>404 handling</strong> - Custom not found pages</li>
      </ul>

      <h2 class="section-heading">Performance Optimizations</h2>
      <ul>
        <li><strong>Prefetch on hover</strong> - Load data before clicks</li>
        <li><strong>Cache aggressively</strong> - Use appropriate cache strategies</li>
        <li><strong>Lazy load routes</strong> - Code-split with dynamic imports</li>
        <li><strong>Parallel data fetching</strong> - Load multiple resources concurrently</li>
        <li><strong>Optimistic UI</strong> - Show UI before data loads</li>
      </ul>

      ${createCodeBlock(`
// Lazy load route components
route({
  path: '/heavy-page',
  component: async () => {
    const module = await import('./heavy-page.js');
    return module.render();
  }
})

// Parallel data fetching
loader: async ({ params, signal }) => {
  const [user, posts, comments] = await Promise.all([
    fetchUser(params.id, signal),
    fetchPosts(params.id, signal),
    fetchComments(params.id, signal)
  ]);

  return { user, posts, comments };
}
      `, 'optimizations.js')}\n
      <h2 class="section-heading">Congratulations!</h2>
      <p>
        You've completed all 20 examples and learned everything from basic routing to
        production-ready patterns. You now have the knowledge to build fast, reliable
        SPAs with @overhead/router!
      </p>

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">What you've mastered:</h3>
      <ul>
        <li>Beginner: Routes, navigation, parameters, query strings</li>
        <li>Intermediate: Data loaders, abort signals, basic guards</li>
        <li>Advanced: Enhanced guards, nested routes, caching, redirects</li>
        <li>Expert: Breadcrumbs, prefetching, error handling, full apps</li>
      </ul>

      <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Next steps:</h3>
      <ul>
        <li>Build a real application with @overhead/router</li>
        <li>Explore the API documentation for advanced features</li>
        <li>Join the community and share what you build</li>
        <li>Contribute examples or improvements to the tutorial</li>
      </ul>

      <div class="navigation-controls">
        <a href="/examples/19-error-handling" class="nav-button">← Previous: Error Handling</a>
        <a href="/examples/01-hello-router" class="nav-button">Start Over →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Full App Pattern Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Simulated auth state
      let authState = {
        isLoggedIn: false,
        user: null
      };

      const users = {
        'user': { id: 1, name: 'Demo User', email: 'user@example.com', role: 'user' },
        'admin': { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
      };

      demoContainer.innerHTML = `
        <div id="mini-app" style="border: 1px solid #ddd; min-height: 280px;">
          <p style="color: #666; padding: 16px;">Loading...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          // Public: Login page
          route({
            path: '/login',
            component: () => {
              app.innerHTML = `
                <div style="padding: 24px; max-width: 400px; margin: 0 auto;">
                  <h2 style="margin: 0 0 24px 0;">Login</h2>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button
                      id="login-user"
                      style="padding: 12px; border: 1px solid #000; background: white; cursor: pointer; text-align: left;"
                    >
                      Login as User
                    </button>
                    <button
                      id="login-admin"
                      style="padding: 12px; border: 1px solid #000; background: white; cursor: pointer; text-align: left;"
                    >
                      Login as Admin
                    </button>
                  </div>
                </div>
              `;

              app.querySelector('#login-user').addEventListener('click', () => {
                authState = { isLoggedIn: true, user: users.user };
                logger.log('Logged in as User');
                router.navigate('/app');
              });

              app.querySelector('#login-admin').addEventListener('click', () => {
                authState = { isLoggedIn: true, user: users.admin };
                logger.log('Logged in as Admin');
                router.navigate('/app');
              });

              logger.log('Showing login page');
            }
          }),

          // Protected: App shell with nested routes
          route({
            path: '/app',
            guard: () => {
              if (!authState.isLoggedIn) {
                logger.log('🔒 Guard: Not authenticated, redirecting to login');
                return { redirect: '/login' };
              }
              logger.log('✓ Guard: Authenticated, passing user context');
              return {
                allow: true,
                context: { user: authState.user }
              };
            },
            component: () => {
              app.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 100%;">
                  <header style="padding: 16px; background: #000; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <strong>My App</strong>
                    <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                      <span>${authState.user.name}</span>
                      <button
                        id="logout-btn"
                        style="padding: 4px 12px; border: 1px solid white; background: transparent; color: white; cursor: pointer; font-size: 12px;"
                      >Logout</button>
                    </div>
                  </header>
                  <div style="display: flex; flex: 1;">
                    <nav style="width: 140px; background: #f5f5f5; border-right: 1px solid #ddd; padding: 16px;">
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <a href="/app" style="color: #000; text-decoration: none; padding: 6px 8px;">Dashboard</a>
                        <a href="/app/profile" style="color: #000; text-decoration: none; padding: 6px 8px;">Profile</a>
                        <a href="/app/settings" style="color: #000; text-decoration: none; padding: 6px 8px;">Settings</a>
                      </div>
                    </nav>
                    <main id="app-content" style="flex: 1; padding: 16px;">
                      <p style="color: #666;">Loading...</p>
                    </main>
                  </div>
                </div>
              `;

              app.querySelector('#logout-btn').addEventListener('click', () => {
                authState = { isLoggedIn: false, user: null };
                logger.log('Logged out');
                router.navigate('/login');
              });

              logger.log('Rendered app shell');
            },
            children: [
              route({
                path: '/',
                loader: async ({ context }) => {
                  logger.log(`Loading dashboard for ${context.user.name}...`);
                  await new Promise(resolve => setTimeout(resolve, 300));
                  return {
                    stats: { views: 1247, likes: 89, comments: 34 },
                    activity: ['Logged in', 'Viewed profile', 'Updated settings']
                  };
                },
                component: (match) => {
                  const content = app.querySelector('#app-content');
                  if (content) {
                    content.innerHTML = `
                      <h2 style="margin: 0 0 16px 0;">Dashboard</h2>
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                          <div style="font-size: 24px; font-weight: bold;">${match.data.stats.views}</div>
                          <div style="font-size: 12px; color: #666;">Views</div>
                        </div>
                        <div style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                          <div style="font-size: 24px; font-weight: bold;">${match.data.stats.likes}</div>
                          <div style="font-size: 12px; color: #666;">Likes</div>
                        </div>
                        <div style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                          <div style="font-size: 24px; font-weight: bold;">${match.data.stats.comments}</div>
                          <div style="font-size: 12px; color: #666;">Comments</div>
                        </div>
                      </div>
                    `;
                  }
                  logger.log('✓ Dashboard rendered with data');
                }
              }),

              route({
                path: '/profile',
                loader: async ({ context }) => {
                  logger.log('Loading profile...');
                  await new Promise(resolve => setTimeout(resolve, 200));
                  return context.user;
                },
                component: (match) => {
                  const content = app.querySelector('#app-content');
                  if (content) {
                    content.innerHTML = `
                      <h2 style="margin: 0 0 16px 0;">Profile</h2>
                      <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div><strong>Name:</strong> ${match.data.name}</div>
                        <div><strong>Email:</strong> ${match.data.email}</div>
                        <div><strong>Role:</strong> ${match.data.role}</div>
                      </div>
                    `;
                  }
                  logger.log('✓ Profile rendered');
                }
              }),

              route({
                path: '/settings',
                component: () => {
                  const content = app.querySelector('#app-content');
                  if (content) {
                    content.innerHTML = `
                      <h2 style="margin: 0 0 16px 0;">Settings</h2>
                      <p style="color: #666;">Account settings and preferences.</p>
                    `;
                  }
                  logger.log('✓ Settings rendered');
                }
              })
            ]
          })
        ],

        unauthorized: () => {
          app.innerHTML = `
            <div style="padding: 24px; text-align: center;">
              <h2 style="margin: 0 0 12px 0;">Access Denied</h2>
              <a href="/login" style="color: #000; text-decoration: underline;">Please login</a>
            </div>
          `;
          logger.log('❌ Unauthorized access');
        },

        ssr: true
      });

      logger.log('Full app initialized with auth + nested routes');
      logger.log('Try logging in and exploring the app');

      router.navigate('/login');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
