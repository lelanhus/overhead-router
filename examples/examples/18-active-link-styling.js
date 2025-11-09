/**
 * Example 18: Active Link Styling
 * Highlight current page in navigation with getActiveClass()
 */

import { createCodeBlock } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

export async function render() {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">Expert</span>
      </div>

      <h1 class="example-title">18. Active Link Styling</h1>
      <p class="example-description">
        Automatically highlight the current page in navigation menus. Use subscriptions
        or utility functions to apply active states to nav links.
      </p>

      <h2 class="section-heading">Why Active Link Styling?</h2>
      <p>
        Active link styling helps users understand where they are in your app. It provides
        visual feedback that improves navigation orientation and user experience.
      </p>

      ${createCodeBlock(`
/* CSS for active links */
nav a {
  color: #000;
  text-decoration: none;
  padding: 8px 16px;
  border-bottom: 2px solid transparent;
}

nav a.active {
  border-bottom-color: #000;
  font-weight: bold;
}

nav a:hover {
  background: #f5f5f5;
}
      `, 'styles.css')}\n
      <h2 class="section-heading">Pattern 1: Subscription-Based</h2>
      <p>
        Update active class on every navigation using router subscriptions:
      </p>

      ${createCodeBlock(`
import { createRouter } from '@overhead/router';

const router = createRouter({/* ... */});

// Subscribe to route changes
router.subscribe((match) => {
  // Remove all active classes
  document.querySelectorAll('nav a.active').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to current page link
  const activeLink = document.querySelector(
    \`nav a[href="\${match.path}"]\`
  );

  activeLink?.classList.add('active');
});
      `, 'subscription-pattern.js')}\n
      <h2 class="section-heading">Pattern 2: Utility Function</h2>
      <p>
        Create a helper function to check if a path is active:
      </p>

      ${createCodeBlock(`
function getActiveClass(linkPath, currentPath, exact = false) {
  if (exact) {
    // Exact match
    return linkPath === currentPath ? 'active' : '';
  } else {
    // Prefix match (for nested routes)
    return currentPath.startsWith(linkPath) ? 'active' : '';
  }
}

// Usage in render
function renderNav(currentPath) {
  return \`
    <nav>
      <a href="/" class="\${getActiveClass('/', currentPath, true)}">
        Home
      </a>
      <a href="/products" class="\${getActiveClass('/products', currentPath)}">
        Products
      </a>
      <a href="/about" class="\${getActiveClass('/about', currentPath, true)}">
        About
      </a>
    </nav>
  \`;
}
      `, 'utility-pattern.js')}\n
      <h2 class="section-heading">Pattern 3: Data Attributes</h2>
      <p>
        Use data attributes for more flexible matching:
      </p>

      ${createCodeBlock(`
<nav>
  <a href="/" data-active-exact>Home</a>
  <a href="/products" data-active-prefix="/products">Products</a>
  <a href="/blog" data-active-prefix="/blog">Blog</a>
</nav>

<script>
router.subscribe((match) => {
  document.querySelectorAll('[data-active-exact]').forEach(link => {
    link.classList.toggle('active',
      link.getAttribute('href') === match.path
    );
  });

  document.querySelectorAll('[data-active-prefix]').forEach(link => {
    const prefix = link.dataset.activePrefix;
    link.classList.toggle('active',
      match.path.startsWith(prefix)
    );
  });
});
</script>
      `, 'data-attr-pattern.html')}\n
      <h2 class="section-heading">Exact vs Prefix Matching</h2>
      <p>
        Choose between exact or prefix matching based on your navigation structure:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="text-align: left; padding: 8px;">Strategy</th>
            <th style="text-align: left; padding: 8px;">When to Use</th>
            <th style="text-align: left; padding: 8px;">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Exact</strong></td>
            <td style="padding: 8px;">Top-level pages</td>
            <td style="padding: 8px;">/about matches only /about</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Prefix</strong></td>
            <td style="padding: 8px;">Nested routes</td>
            <td style="padding: 8px;">/products matches /products/*</td>
          </tr>
        </tbody>
      </table>

      ${createCodeBlock(`
// Home link: exact match only
<a href="/" class="\${match.path === '/' ? 'active' : ''}">
  Home
</a>

// Products: active for /products and /products/*
<a href="/products"
   class="\${match.path.startsWith('/products') ? 'active' : ''}">
  Products
</a>

// About: exact match only
<a href="/about"
   class="\${match.path === '/about' ? 'active' : ''}">
  About
</a>
      `, 'matching-strategy.html')}\n
      <h2 class="section-heading">Live Demo</h2>
      <p>
        This demo shows automatic active link highlighting. Navigate between pages
        to see the active state update.
      </p>

      <div id="demo-container"></div>

      <h2 class="section-heading">Aria Attributes</h2>
      <p>
        Add accessibility with aria-current for screen readers:
      </p>

      ${createCodeBlock(`
router.subscribe((match) => {
  // Remove all aria-current
  document.querySelectorAll('nav a[aria-current]').forEach(link => {
    link.removeAttribute('aria-current');
  });

  // Add to active link
  const activeLink = document.querySelector(\`nav a[href="\${match.path}"]\`);
  if (activeLink) {
    activeLink.setAttribute('aria-current', 'page');
    activeLink.classList.add('active');
  }
});
      `, 'aria-current.js')}\n
      <h2 class="section-heading">Multiple Active States</h2>
      <p>
        Support multiple levels of active states for nested navigation:
      </p>

      ${createCodeBlock(`
function getActiveState(linkPath, currentPath) {
  if (linkPath === currentPath) {
    return 'exact';  // Exact match
  } else if (currentPath.startsWith(linkPath)) {
    return 'partial';  // Parent of current page
  }
  return '';  // Not active
}

// CSS for different states
nav a.active-exact {
  background: #000;
  color: #fff;
}

nav a.active-partial {
  border-left: 3px solid #000;
}
      `, 'multiple-states.js')}\n
      <h2 class="section-heading">Best Practices</h2>
      <ul>
        <li><strong>Use exact match for home</strong> - Prevent home link being active on all pages</li>
        <li><strong>Prefix match for sections</strong> - Keep section nav highlighted on child pages</li>
        <li><strong>Add aria-current</strong> - Improves accessibility for screen readers</li>
        <li><strong>Visual hierarchy</strong> - Make active state clearly distinct from hover</li>
        <li><strong>Performance</strong> - Use event delegation instead of many listeners</li>
      </ul>

      <h2 class="section-heading">Next Steps</h2>
      <p>
        You've mastered active link styling! Next, we'll explore comprehensive error
        handling for navigation failures and edge cases.
      </p>

      <div class="navigation-controls">
        <a href="/examples/17-route-prefetching" class="nav-button">← Previous: Route Prefetching</a>
        <a href="/examples/19-error-handling" class="nav-button">Next: Error Handling →</a>
      </div>
    </div>
  `;
}

export function setup(container) {
  import('../../dist/index.js').then(({ createRouter, route }) => {
    const { html, demoId } = createDemoFrame('Active Link Styling Demo', (demoContainer, outputEl) => {
      const logger = createLogger(outputEl);

      function getActiveClass(linkPath, currentPath, exact = false) {
        if (exact) {
          return linkPath === currentPath ? 'active' : '';
        }
        return currentPath.startsWith(linkPath) && linkPath !== '/' ? 'active' : '';
      }

      demoContainer.innerHTML = `
        <div id="mini-app" style="border: 1px solid #ddd; min-height: 220px;">
          <p style="color: #666; padding: 16px;">Loading...</p>
        </div>
      `;

      const app = demoContainer.querySelector('#mini-app');

      const router = createRouter({
        routes: [
          route({
            path: '/',
            component: (match) => {
              renderPage('Home', 'Welcome to the home page!', match.path);
            }
          }),

          route({
            path: '/products',
            component: (match) => {
              renderPage('Products', 'Browse our products.', match.path, `
                <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                  <a href="/products/laptop" style="color: #000; text-decoration: underline;">→ Laptop</a>
                  <a href="/products/mouse" style="color: #000; text-decoration: underline;">→ Mouse</a>
                </div>
              `);
            }
          }),

          route({
            path: '/products/:id',
            component: (match) => {
              renderPage(`Product: ${match.params.id}`, `Details for ${match.params.id}`, match.path);
            }
          }),

          route({
            path: '/about',
            component: (match) => {
              renderPage('About', 'Learn about our company.', match.path);
            }
          }),

          route({
            path: '/contact',
            component: (match) => {
              renderPage('Contact', 'Get in touch with us.', match.path);
            }
          })
        ],

        ssr: true
      });

      function renderPage(title, description, currentPath, extraContent = '') {
        const homeActive = getActiveClass('/', currentPath, true);
        const productsActive = getActiveClass('/products', currentPath);
        const aboutActive = getActiveClass('/about', currentPath, true);
        const contactActive = getActiveClass('/contact', currentPath, true);

        app.innerHTML = `
          <nav style="
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            padding: 0;
            display: flex;
          ">
            <a href="/" class="${homeActive}" style="
              padding: 12px 20px;
              color: #000;
              text-decoration: none;
              border-bottom: 3px solid ${homeActive ? '#000' : 'transparent'};
              font-weight: ${homeActive ? 'bold' : 'normal'};
              background: ${homeActive ? 'white' : 'transparent'};
            ">Home</a>
            <a href="/products" class="${productsActive}" style="
              padding: 12px 20px;
              color: #000;
              text-decoration: none;
              border-bottom: 3px solid ${productsActive ? '#000' : 'transparent'};
              font-weight: ${productsActive ? 'bold' : 'normal'};
              background: ${productsActive ? 'white' : 'transparent'};
            ">Products</a>
            <a href="/about" class="${aboutActive}" style="
              padding: 12px 20px;
              color: #000;
              text-decoration: none;
              border-bottom: 3px solid ${aboutActive ? '#000' : 'transparent'};
              font-weight: ${aboutActive ? 'bold' : 'normal'};
              background: ${aboutActive ? 'white' : 'transparent'};
            ">About</a>
            <a href="/contact" class="${contactActive}" style="
              padding: 12px 20px;
              color: #000;
              text-decoration: none;
              border-bottom: 3px solid ${contactActive ? '#000' : 'transparent'};
              font-weight: ${contactActive ? 'bold' : 'normal'};
              background: ${contactActive ? 'white' : 'transparent'};
            ">Contact</a>
          </nav>

          <div style="padding: 16px;">
            <h2 style="margin: 0 0 12px 0;">${title}</h2>
            <p style="margin: 0; color: #666;">${description}</p>
            ${extraContent}
            <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; font-size: 12px;">
              <strong>Current path:</strong> ${currentPath}<br>
              <strong>Active nav:</strong> ${[homeActive, productsActive, aboutActive, contactActive].filter(Boolean)[0] || 'none'}
            </div>
          </div>
        `;

        const activeNav = [
          homeActive && 'Home',
          productsActive && 'Products',
          aboutActive && 'About',
          contactActive && 'Contact'
        ].filter(Boolean)[0];

        logger.log(`Active link: ${activeNav || 'none'} (path: ${currentPath})`);
      }

      logger.log('Router initialized with active link styling');
      logger.log('Navigate to see active state updates');

      router.navigate('/');
    });

    const demoContainer = container.querySelector('#demo-container');
    demoContainer.innerHTML = html;
    window.resetDemo(demoId);
  });
}
