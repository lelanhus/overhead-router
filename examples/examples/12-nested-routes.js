/**
 * Example 12: Nested Routes
 * Parent layouts with child routes for reusable page structures
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Advanced</span>
      </div>

      <h1 class="example-title">12. Nested Routes</h1>
      <p class="example-description">
        Nested routes let you create layouts that wrap child routes. Perfect for dashboards,
        settings pages, or any UI where multiple pages share a common structure.
      </p>

      <h2 class="section-heading">What are Nested Routes?</h2>
      <p>
        A nested route has a parent component that renders a layout, plus child routes
        that render inside that layout. The parent persists while children change.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    // Parent route with children
    route({
      path: '/dashboard',
      component: () => {
        render(\`
          <div class="dashboard-layout">
            <nav>
              <a href="/dashboard">Overview</a>
              <a href="/dashboard/analytics">Analytics</a>
              <a href="/dashboard/settings">Settings</a>
            </nav>
            <div id="child-content">
              <!-- Child routes render here -->
            </div>
          </div>
        \`);
      },
      children: [
        route({
          path: '/',
          component: () => {
            renderChild('<h1>Dashboard Overview</h1>');
          }
        }),
        route({
          path: '/analytics',
          component: () => {
            renderChild('<h1>Analytics</h1>');
          }
        }),
        route({
          path: '/settings',
          component: () => {
            renderChild('<h1>Settings</h1>');
          }
        })
      ]
    })
  ]
});

function renderChild(html) {
  document.getElementById('child-content').innerHTML = html;
}
      `, 'nested-routes.js')}\n
      <h2 class="section-heading">Path Resolution</h2>
      <p>
        Child route paths are relative to their parent. The full URL is the parent path
        plus the child path:
      </p>

      ${createCodeBlock(`
route({
  path: '/dashboard',  // Parent path
  children: [
    route({
      path: '/',         // → /dashboard
      component: () => renderChild('Overview')
    }),
    route({
      path: '/analytics',  // → /dashboard/analytics
      component: () => renderChild('Analytics')
    }),
    route({
      path: '/settings',   // → /dashboard/settings
      component: () => renderChild('Settings')
    })
  ]
})
      `, 'path-resolution.js')}\n
      <h2 class="section-heading">Shared Layouts</h2>
      <p>
        Nested routes are perfect for shared layouts like admin panels, user settings,
        or multi-step forms where the navigation persists across pages:
      </p>

      ${createCodeBlock(`
// Admin layout with sidebar
route({
  path: '/admin',
  component: () => {
    render(\`
      <div class="admin-layout">
        <aside class="sidebar">
          <h2>Admin</h2>
          <nav>
            <a href="/admin">Dashboard</a>
            <a href="/admin/users">Users</a>
            <a href="/admin/posts">Posts</a>
            <a href="/admin/settings">Settings</a>
          </nav>
        </aside>
        <main id="admin-content">
          <!-- Children render here -->
        </main>
      </div>
    \`);
  },
  children: [
    route({
      path: '/',
      loader: () => fetchDashboardStats(),
      component: (match) => {
        renderAdmin(\`<h1>Dashboard</h1>\`);
      }
    }),
    route({
      path: '/users',
      loader: () => fetchUsers(),
      component: (match) => {
        const users = match.data;
        renderAdmin(\`<h1>Users (\${users.length})</h1>\`);
      }
    })
  ]
})
      `, 'shared-layout.js')}\n
      <h2 class="section-heading">Guards and Loaders</h2>
      <p>
        Both parent and child routes can have guards and loaders. They execute in order:
        parent guard → child guard → parent loader → child loader
      </p>

      ${createCodeBlock(`
route({
  path: '/admin',

  // Parent guard runs first
  guard: () => {
    return isAdmin();
  },

  // Parent loader runs after guards pass
  loader: async () => {
    return fetchAdminConfig();
  },

  component: (match) => {
    const config = match.data;
    render(\`<div class="admin">\${config.title}</div>\`);
  },

  children: [
    route({
      path: '/users',

      // Child guard runs after parent guard
      guard: () => {
        return hasPermission('view-users');
      },

      // Child loader runs after parent loader
      loader: async () => {
        return fetchUsers();
      },

      component: (match) => {
        const users = match.data;
        renderChild(\`<h1>Users</h1>\`);
      }
    })
  ]
})

// Execution order:
// 1. Parent guard (isAdmin)
// 2. Child guard (hasPermission)
// 3. Parent loader (fetchAdminConfig)
// 4. Child loader (fetchUsers)
// 5. Parent component
// 6. Child component
      `, 'guards-loaders.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a settings page with nested routes. The sidebar layout persists
        while the content area changes based on the active child route.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Deep Nesting</h2>
      <p>
        You can nest routes as deeply as needed. Each level can have its own layout:
      </p>

      ${createCodeBlock(`
route({
  path: '/app',
  component: () => render('<div>App Shell</div>'),
  children: [
    route({
      path: '/dashboard',
      component: () => renderChild('<div>Dashboard Shell</div>'),
      children: [
        route({
          path: '/analytics',
          component: () => renderGrandchild('<h1>Analytics</h1>')
          // URL: /app/dashboard/analytics
        })
      ]
    })
  ]
})
      `, 'deep-nesting.js')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Shallow nesting</strong> - Keep nesting 1-2 levels deep for simplicity</li>
        <li><strong>Shared state</strong> - Parent loaders can fetch shared data for all children</li>
        <li><strong>Active links</strong> - Use path matching to highlight active nav items</li>
        <li><strong>Layout reuse</strong> - Extract common layouts into reusable patterns</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've learned how to structure apps with nested routes! Next, we'll explore
        cache strategies for optimizing data loading performance.
      </p>

      <div class="navigation-controls">
        <a href="/examples/11-enhanced-guards" class="nav-button">← Previous: Enhanced Guards</a>
        <a href="/examples/13-cache-strategies" class="nav-button">Next: Cache Strategies →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Nested Routes Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      demoContainer.innerHTML = `
        <div id="mini-app" style="border: 1px solid #ddd; min-height: 240px;">
          <p style="color: #666; padding: 16px;">Loading...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          // Nested route: Settings with children
          route({
            path: '/settings',

            component: () => {
              app.innerHTML = `
                <div style="display: flex; height: 100%;">
                  <!-- Sidebar (parent layout) -->
                  <nav style="
                    width: 160px;
                    background: #f5f5f5;
                    border-right: 1px solid #ddd;
                    padding: 16px;
                  ">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: bold;">Settings</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                      <a href="/settings" style="color: #000; text-decoration: none; padding: 6px 8px; border-radius: 2px; background: ${router.getCurrentMatch()?.path === '/settings' ? '#000' : 'transparent'}; color: ${router.getCurrentMatch()?.path === '/settings' ? 'white' : '#000'};">
                        Profile
                      </a>
                      <a href="/settings/account" style="color: #000; text-decoration: none; padding: 6px 8px; border-radius: 2px; background: ${router.getCurrentMatch()?.path === '/settings/account' ? '#000' : 'transparent'}; color: ${router.getCurrentMatch()?.path === '/settings/account' ? 'white' : '#000'};">
                        Account
                      </a>
                      <a href="/settings/privacy" style="color: #000; text-decoration: none; padding: 6px 8px; border-radius: 2px; background: ${router.getCurrentMatch()?.path === '/settings/privacy' ? '#000' : 'transparent'}; color: ${router.getCurrentMatch()?.path === '/settings/privacy' ? 'white' : '#000'};">
                        Privacy
                      </a>
                      <a href="/settings/notifications" style="color: #000; text-decoration: none; padding: 6px 8px; border-radius: 2px; background: ${router.getCurrentMatch()?.path === '/settings/notifications' ? '#000' : 'transparent'}; color: ${router.getCurrentMatch()?.path === '/settings/notifications' ? 'white' : '#000'};">
                        Notifications
                      </a>
                    </div>
                  </nav>

                  <!-- Content area (child renders here) -->
                  <div id="settings-content" style="flex: 1; padding: 16px;">
                    <p style="color: #999;">Loading content...</p>
                  </div>
                </div>
              `;

              logger.log('Parent component: Rendered settings layout');
            },

            children: [
              route({
                path: '/',
                component: () => {
                  const content = app.querySelector('#settings-content');
                  content.innerHTML = `
                    <h2 style="margin: 0 0 12px 0;">Profile Settings</h2>
                    <p style="margin: 0 0 8px 0;">Update your profile information.</p>
                    <div style="padding: 12px; background: #f5f5f5; margin-top: 12px; font-size: 12px;">
                      <strong>Path:</strong> /settings<br>
                      <strong>Type:</strong> Child route (index)
                    </div>
                  `;
                  logger.log('Child: Profile settings');
                }
              }),

              route({
                path: '/account',
                component: () => {
                  const content = app.querySelector('#settings-content');
                  content.innerHTML = `
                    <h2 style="margin: 0 0 12px 0;">Account Settings</h2>
                    <p style="margin: 0 0 8px 0;">Manage your account and billing.</p>
                    <div style="padding: 12px; background: #f5f5f5; margin-top: 12px; font-size: 12px;">
                      <strong>Path:</strong> /settings/account<br>
                      <strong>Type:</strong> Child route
                    </div>
                  `;
                  logger.log('Child: Account settings');
                }
              }),

              route({
                path: '/privacy',
                component: () => {
                  const content = app.querySelector('#settings-content');
                  content.innerHTML = `
                    <h2 style="margin: 0 0 12px 0;">Privacy Settings</h2>
                    <p style="margin: 0 0 8px 0;">Control your privacy and data.</p>
                    <div style="padding: 12px; background: #f5f5f5; margin-top: 12px; font-size: 12px;">
                      <strong>Path:</strong> /settings/privacy<br>
                      <strong>Type:</strong> Child route
                    </div>
                  `;
                  logger.log('Child: Privacy settings');
                }
              }),

              route({
                path: '/notifications',
                component: () => {
                  const content = app.querySelector('#settings-content');
                  content.innerHTML = `
                    <h2 style="margin: 0 0 12px 0;">Notification Settings</h2>
                    <p style="margin: 0 0 8px 0;">Manage your notification preferences.</p>
                    <div style="padding: 12px; background: #f5f5f5; margin-top: 12px; font-size: 12px;">
                      <strong>Path:</strong> /settings/notifications<br>
                      <strong>Type:</strong> Child route
                    </div>
                  `;
                  logger.log('Child: Notification settings');
                }
              })
            ]
          })
        ],

        ssr: true
      });

      logger.log('Router initialized with nested routes');
      logger.log('Parent layout renders sidebar, children render content');

      router.navigate('/settings');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
