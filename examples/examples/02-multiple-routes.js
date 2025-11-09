/**
 * Example 02: Multiple Routes
 * Building a multi-page application with multiple routes
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Beginner</span>
      </div>

      <h1 class="example-title">02. Multiple Routes</h1>
      <p class="example-description">
        Build a multi-page application by defining multiple routes. Each route
        maps a URL path to a component that renders your page content.
      </p>

      <h2 class="section-heading">Adding More Routes</h2>
      <p>
        To create a multi-page app, simply add more routes to the <code>routes</code> array.
        Each route is independent and declarative.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/',
      component: () => {
        render('<h1>Home Page</h1><p>Welcome!</p>');
      }
    }),

    route({
      path: '/about',
      component: () => {
        render('<h1>About</h1><p>Learn about us.</p>');
      }
    }),

    route({
      path: '/contact',
      component: () => {
        render('<h1>Contact</h1><p>Get in touch.</p>');
      }
    })
  ]
});

function render(html) {
  document.getElementById('app').innerHTML = html;
}
      `, 'multiple-routes.js')}

      <h2 class="section-heading">Key Concepts</h2>
      <ul>
        <li><strong>Route array</strong> - Define as many routes as you need</li>
        <li><strong>Path matching</strong> - Router automatically matches URL to route</li>
        <li><strong>Independent components</strong> - Each route has its own component logic</li>
        <li><strong>Declarative</strong> - Routes are data, not imperative code</li>
      </ul>

      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows three routes in action. Click the navigation buttons to switch
        between pages and watch the component render.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Route Compilation</h2>
      <p>
        When you call <code>createRouter()</code>, the router compiles all your routes once
        at initialization. This means:
      </p>
      <ul>
        <li>Fast route matching (O(n) first time, then memoized)</li>
        <li>All routes validated at startup</li>
        <li>Type-safe parameters extracted from paths</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You now have a multi-page app! But we're still manually calling <code>router.navigate()</code>.
        In the next example, we'll use semantic HTML <code>&lt;a&gt;</code> tags with automatic
        link interception.
      </p>

      <div class="navigation-controls">
        <a href="/examples/01-hello-router" class="nav-button">← Previous: Hello Router</a>
        <a href="/examples/03-link-navigation" class="nav-button">Next: Link Navigation →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Multiple Routes Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 100px;">
          <p style="color: #666;">Navigate to see pages...</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="nav-btn" data-path="/" style="padding: 8px 16px; border: 1px solid #000; background: white; cursor: pointer;">
            Home
          </button>
          <button class="nav-btn" data-path="/about" style="padding: 8px 16px; border: 1px solid #000; background: white; cursor: pointer;">
            About
          </button>
          <button class="nav-btn" data-path="/contact" style="padding: 8px 16px; border: 1px solid #000; background: white; cursor: pointer;">
            Contact
          </button>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = '<h2 style="margin: 0 0 8px 0;">Home Page</h2><p style="margin: 0;">Welcome to the home page!</p>';
              logger.log('Rendered: Home');
            }
          }),

          route({
            path: '/about',
            component: () => {
              app.innerHTML = '<h2 style="margin: 0 0 8px 0;">About</h2><p style="margin: 0;">Learn more about us here.</p>';
              logger.log('Rendered: About');
            }
          }),

          route({
            path: '/contact',
            component: () => {
              app.innerHTML = '<h2 style="margin: 0 0 8px 0;">Contact</h2><p style="margin: 0;">Get in touch with our team.</p>';
              logger.log('Rendered: Contact');
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with 3 routes');

      // Set up navigation buttons
      demoContainer.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const path = btn.dataset.path;
          logger.log(`Navigating to ${path}...`);
          router.navigate(path);
        });
      });
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
