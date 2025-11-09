/**
 * Example 04: Route Parameters
 * Type-safe :userId patterns for dynamic routes
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Beginner</span>
      </div>

      <h1 class="example-title">04. Route Parameters</h1>
      <p class="example-description">
        Create dynamic routes with parameters like <code>/users/:userId</code>. The router
        extracts parameters from the URL and makes them available to your components.
      </p>

      <h2 class="section-heading">Parameter Syntax</h2>
      <p>
        Use a colon (<code>:</code>) prefix to define a parameter in your path. Anything
        in that position will be captured and passed to your component.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    // Static route
    route({
      path: '/users',
      component: () => {
        render('<h1>All Users</h1>');
      }
    }),

    // Dynamic route with parameter
    route({
      path: '/users/:userId',
      component: (match) => {
        const { userId } = match.params;
        render(\`<h1>User: \${userId}</h1>\`);
      }
    })
  ]
});

function render(html) {
  document.getElementById('app').innerHTML = html;
}
      `, 'route-parameters.js')}\n
      <h2 class="section-heading">How It Works</h2>
      <p>
        When you navigate to <code>/users/123</code>, the router:
      </p>
      <ol>
        <li>Matches the URL against the pattern <code>/users/:userId</code></li>
        <li>Extracts <code>"123"</code> from the URL</li>
        <li>Creates a params object: <code>{ userId: "123" }</code></li>
        <li>Passes it to your component via <code>match.params</code></li>
      </ol>

      <h2 class="section-heading">Multiple Parameters</h2>
      <p>
        You can have multiple parameters in a single route. Each <code>:param</code> becomes
        a property in the params object.
      </p>

      ${createCodeBlock(`
// Route with multiple parameters
route({
  path: '/users/:userId/posts/:postId',
  component: (match) => {
    const { userId, postId } = match.params;
    render(\`
      <h1>User \${userId}</h1>
      <h2>Post \${postId}</h2>
    \`);
  }
})

// Example URLs:
// /users/42/posts/7 → { userId: "42", postId: "7" }
// /users/alice/posts/hello-world → { userId: "alice", postId: "hello-world" }
      `, 'multiple-params.js')}\n
      <h2 class="section-heading">Type Safety</h2>
      <p>
        With TypeScript, the router automatically infers parameter types from your path string.
        This means autocomplete and type checking for your params!
      </p>

      ${createCodeBlock(`
// TypeScript knows the shape of params from the path
route({
  path: '/products/:productId/reviews/:reviewId',
  component: (match) => {
    // ✓ TypeScript autocompletes: productId, reviewId
    const { productId, reviewId } = match.params;

    // ❌ TypeScript error: Property 'invalid' does not exist
    // const { invalid } = match.params;
  }
})
      `, 'type-safety.ts')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a user profile route with a <code>:userId</code> parameter.
        Click different users to see the parameter extraction in action.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Parameter Constraints</h2>
      <ul>
        <li><strong>Always strings</strong> - Parameters are always strings (even if they look like numbers)</li>
        <li><strong>URL-encoded</strong> - Special characters are automatically decoded</li>
        <li><strong>Required</strong> - Parameters must be present (can't be empty)</li>
        <li><strong>Greedy</strong> - Parameters match everything until the next <code>/</code></li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've learned how to define and extract route parameters. In the next example,
        we'll use these parameters to fetch data and render dynamic content.
      </p>

      <div class="navigation-controls">
        <a href="/examples/03-link-navigation" class="nav-button">← Previous: Link Navigation</a>
        <a href="/examples/05-using-parameters" class="nav-button">Next: Using Parameters →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Route Parameters Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      // Mock user data
      const users = {
        'alice': { name: 'Alice Johnson', role: 'Engineer' },
        'bob': { name: 'Bob Smith', role: 'Designer' },
        'carol': { name: 'Carol Williams', role: 'Product Manager' }
      };

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 140px;">
          <p style="color: #666;">Select a user to view their profile...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: () => {
              app.innerHTML = `
                <h2 style="margin: 0 0 12px 0;">User Directory</h2>
                <nav style="display: flex; flex-direction: column; gap: 8px;">
                  <a href="/users/alice" style="color: #000; text-decoration: underline;">→ Alice's Profile</a>
                  <a href="/users/bob" style="color: #000; text-decoration: underline;">→ Bob's Profile</a>
                  <a href="/users/carol" style="color: #000; text-decoration: underline;">→ Carol's Profile</a>
                </nav>
              `;
              logger.log('Rendered: User Directory');
            }
          }),

          route({
            path: '/users/:userId',
            component: (match) => {
              const { userId } = match.params;
              const user = users[userId];

              if (user) {
                app.innerHTML = `
                  <h2 style="margin: 0 0 8px 0;">${user.name}</h2>
                  <p style="margin: 0 0 12px 0; color: #666;">${user.role}</p>
                  <p style="margin: 0 0 12px 0; font-family: monospace; font-size: 12px; color: #999;">
                    userId: "${userId}"
                  </p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Back to Directory</a>
                `;
                logger.log(`Extracted param: { userId: "${userId}" }`);
                logger.log(`Rendered: ${user.name}'s profile`);
              } else {
                app.innerHTML = `
                  <h2 style="margin: 0 0 12px 0;">User Not Found</h2>
                  <p style="margin: 0 0 12px 0;">No user with ID: ${userId}</p>
                  <a href="/" style="color: #000; text-decoration: underline;">← Back to Directory</a>
                `;
                logger.log(`Param extracted but user not found: "${userId}"`);
              }
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with parameter extraction');
      logger.log('Click a user to see params in action');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
