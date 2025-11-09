/**
 * Example 01: Hello Router
 * The absolute minimum setup for @overhead/router
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Beginner</span>
      </div>

      <h1 class="example-title">01. Hello Router</h1>
      <p class="example-description">
        The absolute minimum setup for @overhead/router. This example shows
        the simplest possible router configuration with a single route.
      </p>

      <h2 class="section-heading">The Basics</h2>
      <p>
        A router needs just two things: <code>createRouter</code> and at least one <code>route</code>.
        That's it. No complex configuration, no boilerplate—just pure declarative routing.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

// Create router with a single route
const router = createRouter({
  routes: [
    route({
      path: '/',
      component: () => {
        document.getElementById('app').innerHTML = '<h1>Hello, Router!</h1>';
      }
    })
  ]
});

// That's it! The router is now active and handling navigation.
      `, 'minimal-example.js')}

      <h2 class="section-heading">Key Concepts</h2>
      <ul>
        <li><strong>createRouter()</strong> - Initializes the router with configuration</li>
        <li><strong>route()</strong> - Defines a single route with path and component</li>
        <li><strong>component</strong> - A function that renders your page (can be sync or async)</li>
        <li><strong>Automatic activation</strong> - The router starts working immediately</li>
      </ul>

      <h2 class="section-heading">Live Demo</h2>
      <p>
        This interactive demo shows the minimal router in action. Click the "Trigger Route" button
        to navigate to the root path and see the component render.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">What Happens</h2>
      <ol>
        <li><code>createRouter()</code> compiles the routes and sets up browser listeners</li>
        <li>The router matches the current URL against defined routes</li>
        <li>When a match is found, the component function executes</li>
        <li>Your UI updates - no manual DOM manipulation needed!</li>
      </ol>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        This example shows the absolute minimum. In the next example, we'll add multiple routes
        to create a multi-page application.
      </p>

      <div class="navigation-controls">
        <span class="nav-button disabled">← Previous</span>
        <a href="/examples/02-multiple-routes" class="nav-button">Next: Multiple Routes →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  // Import router for live demo
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Minimal Router Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Create a mini app container
      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 80px;">
          <p style="color: #666;">Waiting for navigation...</p>
        </div>
        <button id="trigger-nav" style="padding: 8px 16px; border: 1px solid #000; background: white; cursor: pointer;">
          Trigger Route
        </button>
      `;

      // Create the minimal router
      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              const app = demoContainer.querySelector('#mini-app');
              app.innerHTML = '<h1 style="margin: 0;">Hello, Router!</h1>';
              logger.log('✓ Component rendered!');
            }
          })
        ],
        ssr: true // SSR mode to not interfere with main tutorial router
      });

      logger.log('Router created and initialized');

      // Manual navigation button
      demoContainer.querySelector('#trigger-nav').addEventListener('click', () => {
        logger.log('Navigating to /...');
        router.navigate('/');
      });
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;

    // Initialize demo
    window.resetDemo(demoId);
  });
}
