/**
 * Example 07: Hash Navigation
 * URL fragments and scroll behavior with #section-id
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Intermediate</span>
      </div>

      <h1 class="example-title">07. Hash Navigation</h1>
      <p class="example-description">
        Hash fragments (the <code>#section</code> part of URLs) are perfect for
        linking to specific sections, tabs, or modal states within a page.
      </p>

      <h2 class="section-heading">Accessing the Hash</h2>
      <p>
        The router provides the current hash via <code>match.hash</code>. Note that
        it includes the leading <code>#</code> character.
      </p>

      ${createCodeBlock(`
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route({
      path: '/docs',
      component: (match) => {
        // Access the hash fragment
        const hash = match.hash;  // "#installation" or ""

        // Remove the # symbol if needed
        const sectionId = hash.slice(1);  // "installation" or ""

        render(\`
          <h1>Documentation</h1>
          <nav>
            <a href="/docs#installation">Installation</a>
            <a href="/docs#usage">Usage</a>
            <a href="/docs#api">API Reference</a>
          </nav>
          <div id="content">
            \${renderSection(sectionId || 'introduction')}
          </div>
        \`);

        // Auto-scroll to section
        if (sectionId) {
          const element = document.getElementById(sectionId);
          element?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    })
  ]
});
      `, 'hash-navigation.js')}\n
      <h2 class="section-heading">Hash vs Query Strings</h2>
      <p>
        Both hashes and query strings appear in URLs, but they serve different purposes:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="text-align: left; padding: 8px;">Feature</th>
            <th style="text-align: left; padding: 8px;">Hash (#section)</th>
            <th style="text-align: left; padding: 8px;">Query (?key=value)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Purpose</strong></td>
            <td style="padding: 8px;">In-page navigation</td>
            <td style="padding: 8px;">Filters, search, state</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Sent to server</strong></td>
            <td style="padding: 8px;">No (client-only)</td>
            <td style="padding: 8px;">Yes (in HTTP request)</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Browser scroll</strong></td>
            <td style="padding: 8px;">Automatic to element</td>
            <td style="padding: 8px;">None</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Format</strong></td>
            <td style="padding: 8px;">Single string</td>
            <td style="padding: 8px;">Key-value pairs</td>
          </tr>
        </tbody>
      </table>

      <h2 class="section-heading">Common Use Cases</h2>
      <p>
        Hash fragments are ideal for:
      </p>
      <ul>
        <li><strong>Section links</strong> - Table of contents, jump links</li>
        <li><strong>Tabs</strong> - Switch between tabs without changing the page</li>
        <li><strong>Modals</strong> - Open/close modals with shareable URLs</li>
        <li><strong>Accordion state</strong> - Track which section is expanded</li>
        <li><strong>Scroll position</strong> - Return to specific content</li>
      </ul>

      ${createCodeBlock(`
// Tab navigation
route({
  path: '/profile',
  component: (match) => {
    const tab = match.hash.slice(1) || 'overview';

    render(\`
      <nav class="tabs">
        <a href="/profile#overview" class="\${tab === 'overview' ? 'active' : ''}">
          Overview
        </a>
        <a href="/profile#settings" class="\${tab === 'settings' ? 'active' : ''}">
          Settings
        </a>
        <a href="/profile#activity" class="\${tab === 'activity' ? 'active' : ''}">
          Activity
        </a>
      </nav>
      <div class="tab-content">
        \${renderTab(tab)}
      </div>
    \`);
  }
})
      `, 'tabs-pattern.js')}\n
      <h2 class="section-heading">Combining Params, Query, and Hash</h2>
      <p>
        You can use all three together for powerful URL structures:
      </p>

      ${createCodeBlock(`
route({
  path: '/products/:productId',
  component: (match) => {
    const { productId } = match.params;         // "laptop-pro"
    const variant = match.query.get('variant'); // "silver"
    const section = match.hash.slice(1);        // "reviews"

    // URL: /products/laptop-pro?variant=silver#reviews
    // Render product page, specific variant, scrolled to reviews
  }
})
      `, 'combined-example.js')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows a documentation page with section navigation. Click the links
        to see hash-based navigation in action.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Important Notes</h2>
      <ul>
        <li><strong>Includes #</strong> - <code>match.hash</code> includes the hash symbol (<code>"#section"</code>)</li>
        <li><strong>Empty string</strong> - If no hash, <code>match.hash</code> is <code>""</code> (not null)</li>
        <li><strong>Case sensitive</strong> - <code>#Section</code> and <code>#section</code> are different</li>
        <li><strong>URL encoding</strong> - Special characters are encoded (<code>#hello%20world</code>)</li>
        <li><strong>No server request</strong> - Hash changes don't trigger server requests</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've learned params, query strings, and hashes—the complete URL anatomy! Next,
        we'll explore data loaders for fetching data before components render.
      </p>

      <div class="navigation-controls">
        <a href="/examples/06-query-strings" class="nav-button">← Previous: Query Strings</a>
        <a href="/examples/08-data-loaders" class="nav-button">Next: Data Loaders →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Hash Navigation Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      const sections = {
        'overview': {
          title: 'Overview',
          content: 'Welcome to the documentation. This is the overview section with general information.'
        },
        'installation': {
          title: 'Installation',
          content: 'Install the router using npm install @overhead/router or your preferred package manager.'
        },
        'quickstart': {
          title: 'Quick Start',
          content: 'Get started in 3 minutes with our quick start guide. Create your first route and navigate!'
        },
        'api': {
          title: 'API Reference',
          content: 'Complete API documentation covering createRouter(), route(), navigate(), and more.'
        }
      };

      demoContainer.innerHTML = `
        <div id="mini-app" style="padding: 16px; border: 1px solid #ddd; margin-bottom: 16px; min-height: 200px; max-height: 300px; overflow-y: auto;">
          <p style="color: #666;">Loading docs...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/docs',
            component: (match) => {
              const hash = match.hash;
              const sectionId = hash.slice(1) || 'overview';
              const section = sections[sectionId] || sections.overview;

              logger.log(`Hash: "${hash}" → Section: "${sectionId}"`);

              app.innerHTML = `
                <h2 style="margin: 0 0 16px 0;">Documentation</h2>

                <nav style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                  ${Object.keys(sections).map(id => {
                    const isActive = id === sectionId;
                    return \`
                      <a
                        href="/docs#\${id}"
                        style="
                          padding: 6px 12px;
                          border: 1px solid \${isActive ? '#000' : '#ddd'};
                          background: \${isActive ? '#000' : 'white'};
                          color: \${isActive ? 'white' : '#000'};
                          text-decoration: none;
                          font-size: 13px;
                        "
                      >
                        \${sections[id].title}
                      </a>
                    \`;
                  }).join('')}
                </nav>

                <div style="border-top: 1px solid #ddd; padding-top: 16px;">
                  <h3 id="\${sectionId}" style="margin: 0 0 12px 0;">
                    \${section.title}
                  </h3>
                  <p style="margin: 0; line-height: 1.6;">
                    \${section.content}
                  </p>
                </div>

                <div style="margin-top: 24px; padding: 12px; background: #f5f5f5; font-size: 12px; font-family: monospace;">
                  Current URL state:<br>
                  path: "/docs"<br>
                  hash: "\${hash}"<br>
                  section: "\${sectionId}"
                </div>
              `;

              logger.log(\`Rendered: \${section.title}\`);

              // Simulate scroll (in real app this would scroll to element)
              app.scrollTop = 0;
            }
          })
        ],
        ssr: true
      });

      logger.log('Router initialized with hash navigation');
      logger.log('Click section links to change hash');

      // Start with default section
      router.navigate('/docs#overview');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
