/**
 * Example: Declarative routing with sane-router
 * Shows how to define routes as pure data structures
 */

import { createRouter, route } from '../src/router';

/**
 * Declarative route definitions
 * No imperative code - just data!
 */
const router = createRouter({
  routes: [
    // Home page
    route('/', {
      component: () => import('./pages/home'),
      meta: { title: 'Home' },
    }),

    // Products listing
    route('/products', {
      component: () => import('./pages/products'),
      loader: async () => {
        // Data loading happens automatically
        const res = await fetch('/api/products');
        return res.json();
      },
      meta: { title: 'Products' },
    }),

    // Single product (type-safe params!)
    route('/products/:id', {
      component: () => import('./pages/product-detail'),
      loader: async ({ params, signal }) => {
        // params.id is typed as string
        const res = await fetch(`/api/products/${params.id}`, { signal });
        return res.json();
      },
      meta: { title: 'Product Details' },
    }),

    // Nested routes
    route('/admin', {
      component: () => import('./pages/admin-layout'),
      guard: async (params) => {
        // Route guard - declarative authorization
        const user = await getCurrentUser();
        return user?.role === 'admin';
      },
      children: [
        route('/dashboard', {
          component: () => import('./pages/admin-dashboard'),
        }),
        route('/users', {
          component: () => import('./pages/admin-users'),
        }),
      ],
    }),

    // User profile with nested route
    route('/users/:userId', {
      component: () => import('./pages/user-profile'),
      children: [
        route('/posts/:postId', {
          component: () => import('./pages/user-post'),
          loader: async ({ params, signal }) => {
            // params.userId and params.postId both available
            const res = await fetch(`/api/users/${params.userId}/posts/${params.postId}`, { signal });
            return res.json();
          },
        }),
      ],
    }),
  ],

  // Base path for deployment to subdirectory
  base: '',

  // Declarative error handlers
  notFound: () => {
    document.body.innerHTML = '<h1>404 - Page Not Found</h1>';
  },

  unauthorized: () => {
    router.navigate('/login');
  },

  // Declarative hooks
  hooks: {
    beforeNavigate: async (path) => {
      // Global navigation guard
      console.log('Navigating to:', path);
      return true;
    },
    afterNavigate: async (path) => {
      // Analytics, title updates, etc.
      console.log('Navigated to:', path);

      // Update document title from meta
      const match = router.getCurrentMatch();
      if (match?.route.meta?.title) {
        document.title = match.route.meta.title;
      }
    },
  },
});

/**
 * Subscribe to route changes (reactive!)
 */
router.subscribe((match) => {
  if (match) {
    console.log('Current route:', match.route.path);
    console.log('Route params:', match.params);
    console.log('Query params:', Object.fromEntries(match.query));
  }
});

/**
 * Type-safe programmatic navigation
 */
async function navigateToProduct(id: string) {
  await router.navigate(`/products/${id}`);
}

/**
 * Navigate with options
 */
async function replaceCurrentPage() {
  await router.navigate('/new-page', {
    replace: true,  // Don't add to history
    scroll: false,  // Don't scroll to top
    state: { from: 'somewhere' },  // Custom state
  });
}

/**
 * Semantic HTML just works!
 */
const html = `
  <nav>
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/about">About</a>
    <a href="https://external.com" data-external>External Link</a>
  </nav>
`;

// All internal links are automatically intercepted
// External links (or with data-external) work normally

/**
 * Helper to get current user (example)
 */
async function getCurrentUser() {
  return { id: '1', role: 'admin' };
}

export { router };
