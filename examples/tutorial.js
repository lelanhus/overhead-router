/**
 * Router by Example - Main Tutorial Orchestration
 *
 * This tutorial application is self-referential: it uses @overhead/router
 * for its own navigation to demonstrate the router in action.
 */

import { createRouter, route } from '../dist/index.js';

// Example metadata for all 20 examples
const examples = {
  '01-hello-router': {
    title: '01. Hello Router',
    description: 'Minimal setup with a single route',
    level: 'Beginner'
  },
  '02-multiple-routes': {
    title: '02. Multiple Routes',
    description: 'Adding multiple pages to your application',
    level: 'Beginner'
  },
  '03-link-navigation': {
    title: '03. Link Navigation',
    description: 'Using semantic <a> tags with automatic interception',
    level: 'Beginner'
  },
  '04-route-parameters': {
    title: '04. Route Parameters',
    description: 'Type-safe :userId patterns in your routes',
    level: 'Beginner'
  },
  '05-using-parameters': {
    title: '05. Using Parameters',
    description: 'Accessing and using path parameters in components',
    level: 'Beginner'
  },
  '06-query-strings': {
    title: '06. Query Strings',
    description: 'Reading ?search=foo&filter=bar from URLs',
    level: 'Intermediate'
  },
  '07-hash-navigation': {
    title: '07. Hash Navigation',
    description: 'URL fragments and same-page navigation',
    level: 'Intermediate'
  },
  '08-data-loaders': {
    title: '08. Data Loaders',
    description: 'Async data fetching with parallel loading',
    level: 'Intermediate'
  },
  '09-abort-signals': {
    title: '09. Abort Signals',
    description: 'Cancelling requests on navigation',
    level: 'Intermediate'
  },
  '10-basic-guards': {
    title: '10. Route Guards (Basic)',
    description: 'Simple boolean allow/deny guards',
    level: 'Intermediate'
  },
  '11-enhanced-guards': {
    title: '11. Enhanced Guards',
    description: 'Redirect, deny with reason, context passing',
    level: 'Advanced'
  },
  '12-nested-routes': {
    title: '12. Nested Routes',
    description: 'Parent layouts with child routes',
    level: 'Advanced'
  },
  '13-cache-strategies': {
    title: '13. Cache Strategies',
    description: 'Per-route caching (params, query, full)',
    level: 'Advanced'
  },
  '14-redirects': {
    title: '14. Programmatic Redirects',
    description: 'Using redirect() from loaders',
    level: 'Advanced'
  },
  '15-subscriptions': {
    title: '15. Route Subscriptions',
    description: 'Reacting to route changes',
    level: 'Advanced'
  },
  '16-breadcrumbs': {
    title: '16. Breadcrumbs',
    description: 'Automatic breadcrumb generation',
    level: 'Expert'
  },
  '17-prefetching': {
    title: '17. Route Prefetching',
    description: 'Instant navigation with prefetch()',
    level: 'Expert'
  },
  '18-active-links': {
    title: '18. Active Link Styling',
    description: 'getActiveClass() utility',
    level: 'Expert'
  },
  '19-error-handling': {
    title: '19. Error Handling',
    description: 'NavigationError types and recovery',
    level: 'Expert'
  },
  '20-full-app': {
    title: '20. Full App Pattern',
    description: 'Auth guards + nested layouts + data loading',
    level: 'Expert'
  }
};

// Create tutorial router with all example routes
const router = createRouter({
  routes: Object.keys(examples).map(exampleId =>
    route({
      path: `/examples/${exampleId}`,
      component: () => import(`./examples/${exampleId}.js`),
      meta: examples[exampleId]
    })
  ),
  notFound: () => {
    document.getElementById('tutorial-content').innerHTML = `
      <div class="example-content">
        <h1 class="example-title">Example Not Found</h1>
        <p class="example-description">The requested example doesn't exist.</p>
        <p><a href="/examples/01-hello-router">Start with Example 01</a></p>
      </div>
    `;
  }
});

// Subscribe to route changes and render content
router.subscribe((match) => {
  if (!match) return;

  // Update active nav link
  updateActiveNavLink(match.path);

  // Render the example
  renderExample(match);
});

/**
 * Update active navigation link highlighting
 */
function updateActiveNavLink(currentPath) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Render an example's content
 */
async function renderExample(match) {
  const container = document.getElementById('tutorial-content');
  const { route, data } = match;
  const meta = route.meta;

  // Show loading state
  container.innerHTML = '<div class="loading">Loading example...</div>';

  try {
    // Load the example module (already imported by route.component)
    const exampleModule = await route.component();

    // Render the example content
    const content = typeof exampleModule.render === 'function'
      ? await exampleModule.render(match)
      : createDefaultExampleView(meta);

    container.innerHTML = content;

    // Run example setup if provided
    if (typeof exampleModule.setup === 'function') {
      exampleModule.setup(container);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Error rendering example:', error);
    container.innerHTML = `
      <div class="example-content">
        <h1 class="example-title">Error Loading Example</h1>
        <p class="example-description">${error.message}</p>
        <pre class="mt-md">${error.stack}</pre>
      </div>
    `;
  }
}

/**
 * Create default example view if module doesn't provide render()
 */
function createDefaultExampleView(meta) {
  return `
    <div class="example-content">
      <div class="mb-md">
        <span class="text-muted">${meta.level}</span>
      </div>
      <h1 class="example-title">${meta.title}</h1>
      <p class="example-description">${meta.description}</p>
      <p class="text-muted mt-xl">This example is coming soon...</p>
    </div>
  `;
}

// Navigate to first example if on root
if (window.location.pathname === '/' || window.location.pathname === '') {
  router.navigate('/examples/01-hello-router');
}

// Log router for debugging
console.log('Tutorial router initialized:', router);
console.log('Available examples:', Object.keys(examples).length);
