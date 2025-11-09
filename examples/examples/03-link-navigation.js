/**
 * Example 03: Link Navigation
 * Semantic <a> tags with automatic interception
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Beginner</span>
      </div>

      <h1 class="example-title">03. Link Navigation</h1>
      <p class="example-description">
        Use semantic HTML <code>&lt;a&gt;</code> tags for navigation. The router automatically
        intercepts clicks and prevents full page reloads, giving you instant SPA navigation.
      </p>

      <h2 class="section-heading">Automatic Link Interception</h2>
      <p>
        The router watches for clicks on <code>&lt;a&gt;</code> tags. When you click a link,
        the router intercepts it, updates the URL, and navigates—all without a page reload.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/',
      component: () => {
        render(\`
          <h1>Home</h1>
          <nav>
            <a href="/about">Go to About</a>
            <a href="/contact">Go to Contact</a>
          </nav>
        \`);
      }
    }),

    route({
      path: '/about',
      component: () => {
        render(\`
          <h1>About</h1>
          <a href="/">Back to Home</a>
        \`);
      }
    }),

    route({
      path: '/contact',
      component: () => {
        render(\`
          <h1>Contact</h1>
          <a href="/">Back to Home</a>
        \`);
      }
    })
  ]
});

function render(html) {
  document.getElementById('app').innerHTML = html;
}
      `, 'link-navigation.js')}\n
      <h2 class="section-heading">Click Guards</h2>
      <p>
        The router is smart about which clicks to intercept. It ignores clicks that should
        behave like normal browser navigation:
      </p>
      <ul>
        <li><strong>Modified clicks</strong> - Ctrl/Cmd/Shift/Alt + Click opens in new tab</li>
        <li><strong>Right-clicks</strong> - Context menu still works</li>
        <li><strong>Middle-clicks</strong> - Opens in new tab</li>
        <li><strong>External links</strong> - Links to other domains aren't intercepted</li>
        <li><strong>Download links</strong> - <code>download</code> attribute respected</li>
        <li><strong>Target attribute</strong> - <code>target="_blank"</code> opens new tab</li>
        <li><strong>Non-left clicks</strong> - Only left-button clicks are intercepted</li>
        <li><strong>Prevented defaults</strong> - If <code>event.preventDefault()</code> was called</li>
      </ul>

      <h2 class="section-heading">Force External Behavior</h2>
      <p>
        Sometimes you want a link to trigger a full page reload. Use the <code>data-external</code>
        attribute to opt out of interception:
      </p>

      ${createCodeBlock(`
<!-- This link will be intercepted (SPA navigation) -->
<a href="/dashboard">Dashboard</a>

<!-- This link will trigger a full page reload -->
<a href="/logout" data-external>Logout</a>
      `, 'external-links.html')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        Click the links below to see automatic interception in action. Notice how navigation
        is instant with no page reload.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">How It Works</h2>
      <ol>
        <li>Router adds a global click listener to <code>document</code></li>
        <li>On click, it checks if the target is an <code>&lt;a&gt;</code> tag</li>
        <li>It validates the click against 8 guard conditions</li>
        <li>If all guards pass, it calls <code>event.preventDefault()</code></li>
        <li>Then it calls <code>router.navigate(href)</code> internally</li>
        <li>Your component renders instantly—no network request!</li>
      </ol>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        Now you have declarative navigation with zero JavaScript! But what about dynamic routes?
        In the next example, we'll add route parameters like <code>/users/:userId</code>.
      </p>

      <div class="navigation-controls">
        <a href="/examples/02-multiple-routes" class="nav-button">← Previous: Multiple Routes</a>
        <a href="/examples/04-route-parameters" class="nav-button">Next: Route Parameters →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Link Navigation Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 120px;">
          <p style="color: #666;">Click links to navigate...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Home Page</h2>
                <nav style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/about" style="color: #000; text-decoration: underline;">→ About Page</a>
                  <a href="/contact" style="color: #000; text-decoration: underline;">→ Contact Page</a>
                  <a href="/services" style="color: #000; text-decoration: underline;">→ Services Page</a>
                </nav>
              `;
              logger.log('Rendered: Home (with links)');
            }
          }),

          route({
            path: '/about',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">About Us</h2>
                <p style="margin: 0 0 12px 0;">Learn more about our team.</p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Rendered: About (clicked link!)');
            }
          }),

          route({
            path: '/contact',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Contact</h2>
                <p style="margin: 0 0 12px 0;">Get in touch with us.</p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Rendered: Contact (clicked link!)');
            }
          }),

          route({
            path: '/services',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">Our Services</h2>
                <p style="margin: 0 0 12px 0;">Explore what we offer.</p>
                <a href="/" style="color: #000; text-decoration: underline;">← Back to Home</a>
              `;
              logger.log('Rendered: Services (clicked link!)');
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with link interception');
      logger.log('Try clicking the links above ↑');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
