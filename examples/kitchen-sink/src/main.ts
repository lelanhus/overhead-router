/**
 * Kitchen Sink Example - ALL Overhead Router v1.0.0 Features
 *
 * This example demonstrates every single feature of the router:
 * - LoaderContext (params, query, hash, signal)
 * - Route guards
 * - Nested routes (3 levels deep)
 * - Data loading with loaders
 * - Hash navigation
 * - Query parameters
 * - Programmatic navigation
 * - Prefetching
 * - Breadcrumbs
 * - Lifecycle hooks
 * - Error handlers
 * - Metadata
 * - Subscribe pattern
 */

import { createRouter, route } from '@overhead/router';
import type { RouteMatch } from '@overhead/router';

// Mock authentication state
let isAuthenticated = false;

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * COMPREHENSIVE ROUTER CONFIGURATION
 * Showcases all configuration options
 */
const router = createRouter({
  routes: [
    /**
     * HOME ROUTE
     * Simple route with metadata
     */
    route('/', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'Home - Kitchen Sink' },
    }),

    /**
     * ABOUT ROUTE
     * Demonstrates hash navigation and metadata
     */
    route('/about', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'About - Kitchen Sink' },
    }),

    /**
     * PRODUCTS LIST ROUTE
     * Demonstrates data loading with LoaderContext
     */
    route('/products', {
      component: () => Promise.resolve(() => {}),
      loader: async ({ signal }) => {
        await delay(300);
        if (signal.aborted) return null;

        return {
          products: [
            { id: 1, name: 'Laptop Pro', price: 1299, category: 'Electronics' },
            { id: 2, name: 'Wireless Mouse', price: 49, category: 'Accessories' },
            { id: 3, name: 'Mechanical Keyboard', price: 149, category: 'Accessories' },
            { id: 4, name: '4K Monitor', price: 599, category: 'Electronics' },
            { id: 5, name: 'USB-C Hub', price: 79, category: 'Accessories' },
            { id: 6, name: 'Webcam HD', price: 129, category: 'Electronics' },
          ],
        };
      },
      meta: { title: 'Products - Kitchen Sink' },
    }),

    /**
     * PRODUCT DETAIL ROUTE
     * Demonstrates path parameters with LoaderContext
     */
    route('/products/:id', {
      component: () => Promise.resolve(() => {}),
      loader: async ({ params, signal }) => {
        await delay(400);
        if (signal.aborted) return null;

        const products: Record<string, any> = {
          '1': { id: 1, name: 'Laptop Pro', price: 1299, description: 'High-performance laptop', category: 'Electronics' },
          '2': { id: 2, name: 'Wireless Mouse', price: 49, description: 'Ergonomic wireless mouse', category: 'Accessories' },
          '3': { id: 3, name: 'Mechanical Keyboard', price: 149, description: 'RGB mechanical keyboard', category: 'Accessories' },
          '4': { id: 4, name: '4K Monitor', price: 599, description: 'Ultra HD 27-inch monitor', category: 'Electronics' },
          '5': { id: 5, name: 'USB-C Hub', price: 79, description: '7-in-1 USB-C hub', category: 'Accessories' },
          '6': { id: 6, name: 'Webcam HD', price: 129, description: '1080p webcam', category: 'Electronics' },
        };

        return { product: products[params.id] || null };
      },
      meta: { title: 'Product Details - Kitchen Sink' },
    }),

    /**
     * SEARCH ROUTE
     * Demonstrates query parameters with LoaderContext
     */
    route('/search', {
      component: () => Promise.resolve(() => {}),
      loader: async ({ query, signal }) => {
        const searchQuery = query.get('q') || '';
        await delay(300);
        if (signal.aborted) return null;

        const allProducts = [
          { id: 1, name: 'Laptop Pro', price: 1299 },
          { id: 2, name: 'Wireless Mouse', price: 49 },
          { id: 3, name: 'Mechanical Keyboard', price: 149 },
          { id: 4, name: '4K Monitor', price: 599 },
          { id: 5, name: 'USB-C Hub', price: 79 },
          { id: 6, name: 'Webcam HD', price: 129 },
        ];

        const results = searchQuery
          ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          : [];

        return { query: searchQuery, results };
      },
      meta: { title: 'Search - Kitchen Sink' },
    }),

    /**
     * USER PROFILE ROUTE (NESTED)
     * Demonstrates nested routes and params
     */
    route('/users/:userId', {
      component: () => Promise.resolve(() => {}),
      loader: async ({ params, signal }) => {
        await delay(300);
        if (signal.aborted) return null;

        const users: Record<string, any> = {
          '1': { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
          '2': { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
          '3': { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' },
        };

        return { user: users[params.userId] || null };
      },
      meta: { title: 'User Profile - Kitchen Sink' },
      children: [
        /**
         * USER POST ROUTE (LEVEL 2 NESTED)
         * Demonstrates 2-level nested routes
         */
        route('/posts/:postId', {
          component: () => Promise.resolve(() => {}),
          loader: async ({ params, signal }) => {
            await delay(300);
            if (signal.aborted) return null;

            return {
              post: {
                id: params.postId,
                userId: params.userId,
                title: `Post ${params.postId} by User ${params.userId}`,
                content: 'Lorem ipsum dolor sit amet...',
              },
            };
          },
          meta: { title: 'Post Detail - Kitchen Sink' },
          children: [
            /**
             * COMMENT ROUTE (LEVEL 3 NESTED)
             * Demonstrates 3-level nested routes
             */
            route('/comments/:commentId', {
              component: () => Promise.resolve(() => {}),
              loader: async ({ params, signal }) => {
                await delay(300);
                if (signal.aborted) return null;

                return {
                  comment: {
                    id: params.commentId,
                    postId: params.postId,
                    userId: params.userId,
                    text: `Comment ${params.commentId} on post ${params.postId}`,
                    author: 'Commenter Name',
                  },
                };
              },
              meta: { title: 'Comment - Kitchen Sink' },
            }),
          ],
        }),
      ],
    }),

    /**
     * TABS ROUTE
     * Demonstrates hash navigation
     */
    route('/tabs', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'Tabs Demo - Kitchen Sink' },
    }),

    /**
     * ADMIN ROUTE (PROTECTED)
     * Demonstrates route guards
     */
    route('/admin', {
      component: () => Promise.resolve(() => {}),
      guard: () => {
        // Check authentication
        return isAuthenticated;
      },
      meta: { title: 'Admin - Kitchen Sink' },
      children: [
        route('/dashboard', {
          component: () => Promise.resolve(() => {}),
          loader: async ({ signal }) => {
            await delay(300);
            if (signal.aborted) return null;

            return {
              stats: {
                users: 1234,
                products: 567,
                orders: 890,
                revenue: 45678,
              },
            };
          },
          meta: { title: 'Dashboard - Admin' },
        }),
        route('/users', {
          component: () => Promise.resolve(() => {}),
          loader: async ({ signal }) => {
            await delay(300);
            if (signal.aborted) return null;

            return {
              users: [
                { id: 1, name: 'Alice', role: 'Admin' },
                { id: 2, name: 'Bob', role: 'User' },
                { id: 3, name: 'Charlie', role: 'User' },
              ],
            };
          },
          meta: { title: 'Users - Admin' },
        }),
      ],
    }),
  ],

  // Base path (for subdirectory deployment)
  base: '',

  /**
   * NOT FOUND HANDLER
   * Called when no route matches
   */
  notFound: () => {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div class="page">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">← Go home</a></p>
      </div>
    `;
  },

  /**
   * UNAUTHORIZED HANDLER
   * Called when a guard returns false
   */
  unauthorized: () => {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div class="page">
        <div class="warning-box">
          <h2>🔒 Access Denied</h2>
          <p>You need to be authenticated to access this page.</p>
          <button id="login-btn" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            Log In
          </button>
        </div>
      </div>
    `;

    // Handle login
    document.getElementById('login-btn')?.addEventListener('click', () => {
      isAuthenticated = true;
      router.navigate('/admin');
    });
  },

  /**
   * ERROR HANDLER
   * Called when navigation errors occur
   */
  onError: (error) => {
    console.error('Navigation error:', error);

    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div class="page">
        <div class="warning-box">
          <h2>⚠️ Error</h2>
          <p>An error occurred during navigation:</p>
          <code>${error.type}</code>
          ${error.type === 'loader-error' ? `<p>${(error as any).error.message}</p>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * LIFECYCLE HOOKS
   * Global navigation hooks
   */
  hooks: {
    /**
     * BEFORE NAVIGATE HOOK
     * Called before navigation starts (can block navigation)
     */
    beforeNavigate: async (path) => {
      console.log('[beforeNavigate]', path);

      // Example: Confirm navigation away from /search if there's a query
      if (window.location.pathname === '/search' && window.location.search) {
        // In real app, might confirm with user
        // return confirm('Leave search results?');
      }

      return true; // Allow navigation
    },

    /**
     * AFTER NAVIGATE HOOK
     * Called after navigation completes successfully
     */
    afterNavigate: async (path) => {
      console.log('[afterNavigate]', path);

      // Update document title from metadata
      const match = router.getCurrentMatch();
      if (match?.route.meta?.title) {
        document.title = match.route.meta.title as string;
      }

      // Analytics example
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', { page_path: path });
      }

      // Update breadcrumbs
      updateBreadcrumbs();
    },
  },
});

/**
 * SUBSCRIBE TO ROUTE CHANGES
 * Reactive rendering of route content
 */
router.subscribe((match) => {
  const app = document.getElementById('app')!;

  // Update active nav links
  updateActiveLinks();

  if (!match) {
    // 404 handled by notFound handler
    return;
  }

  // Render based on current route
  renderRoute(match);
});

/**
 * UPDATE ACTIVE NAVIGATION LINKS
 */
function updateActiveLinks() {
  const currentPath = router.getCurrentMatch()?.path || '';
  const links = document.querySelectorAll('nav a');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Exact match for root, prefix match for others
    if (href === '/') {
      link.classList.toggle('active', currentPath === '/');
    } else {
      link.classList.toggle('active', currentPath.startsWith(href));
    }
  });
}

/**
 * UPDATE BREADCRUMBS
 * Demonstrates router.getBreadcrumbs() API
 */
function updateBreadcrumbs() {
  const breadcrumbs = router.getBreadcrumbs();
  const container = document.getElementById('breadcrumbs')!;

  if (breadcrumbs.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = breadcrumbs
    .map((crumb, i) => {
      const isLast = i === breadcrumbs.length - 1;
      return isLast
        ? `<span>${crumb.title}</span>`
        : `<a href="${crumb.path}">${crumb.title}</a> <span>/</span>`;
    })
    .join(' ');
}

/**
 * RENDER ROUTE CONTENT
 * Main rendering function for each route
 */
function renderRoute(match: RouteMatch) {
  const app = document.getElementById('app')!;

  // Show loading state
  app.innerHTML = '<div class="page"><div class="loading"></div></div>';

  // Small delay to show loading (in real app, component loads during this time)
  setTimeout(() => {
    switch (match.route.path) {
      case '/':
        renderHome();
        break;
      case '/about':
        renderAbout(match);
        break;
      case '/products':
        renderProducts(match);
        break;
      case '/products/:id':
        renderProductDetail(match);
        break;
      case '/search':
        renderSearch(match);
        break;
      case '/users/:userId':
        renderUserProfile(match);
        break;
      case '/users/:userId/posts/:postId':
        renderPost(match);
        break;
      case '/users/:userId/posts/:postId/comments/:commentId':
        renderComment(match);
        break;
      case '/tabs':
        renderTabs(match);
        break;
      case '/admin':
        renderAdmin();
        break;
      case '/admin/dashboard':
        renderAdminDashboard(match);
        break;
      case '/admin/users':
        renderAdminUsers(match);
        break;
      default:
        app.innerHTML = '<div class="page"><h2>Unknown Route</h2></div>';
    }
  }, 100);
}

// ============================================================================
// PAGE RENDERERS
// ============================================================================

function renderHome() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="page">
      <h2>🎯 Kitchen Sink - ALL Features Demo</h2>
      <p>This example demonstrates every single feature of Overhead Router v1.0.0.</p>

      <div class="info-box">
        <strong>💡 What to explore:</strong>
        <ul>
          <li>Navigate using the links above</li>
          <li>Check browser back/forward buttons</li>
          <li>Hover over some links to see prefetching</li>
          <li>Try the protected Admin section</li>
          <li>Use the Search page with query params</li>
          <li>View the Tabs page for hash navigation</li>
          <li>Open dev console to see lifecycle hooks</li>
        </ul>
      </div>

      <h3>✨ Features Demonstrated</h3>

      <div class="grid">
        <div class="card">
          <h3>📋 LoaderContext</h3>
          <p>All loaders receive <code>{ params, query, hash, signal }</code></p>
        </div>

        <div class="card">
          <h3>🔒 Route Guards</h3>
          <p>Protected routes with authentication checks</p>
          <p><a href="/admin">Try Admin →</a></p>
        </div>

        <div class="card">
          <h3>🔄 Nested Routes</h3>
          <p>Up to 3 levels of route nesting</p>
          <p><a href="/users/1/posts/1">View nested →</a></p>
        </div>

        <div class="card">
          <h3>📦 Data Loading</h3>
          <p>Async loaders with AbortSignal</p>
          <p><a href="/products">View products →</a></p>
        </div>

        <div class="card">
          <h3>🔗 Hash Navigation</h3>
          <p>Hash-only updates without full navigation</p>
          <p><a href="/tabs#tab1">View tabs →</a></p>
        </div>

        <div class="card">
          <h3>🔍 Query Params</h3>
          <p>URL query string handling</p>
          <p><a href="/search?q=laptop">Search →</a></p>
        </div>

        <div class="card">
          <h3>🎯 Programmatic Nav</h3>
          <p><code>router.navigate()</code> with options</p>
          <button onclick="router.navigate('/products', { scroll: false })" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Navigate!</button>
        </div>

        <div class="card">
          <h3>⚡ Prefetching</h3>
          <p>Hover links to prefetch routes</p>
          <p><a href="/products" onmouseenter="router.prefetch('/products')">Hover me →</a></p>
        </div>

        <div class="card">
          <h3>🍞 Breadcrumbs</h3>
          <p><code>router.getBreadcrumbs()</code></p>
          <p>Check the breadcrumbs bar above!</p>
        </div>
      </div>

      <h3 style="margin-top: 2rem;">🛠️ Technical Features</h3>
      <ul>
        <li><strong>Lifecycle Hooks:</strong> beforeNavigate, afterNavigate</li>
        <li><strong>Error Handling:</strong> notFound, unauthorized, onError</li>
        <li><strong>Metadata:</strong> Route titles and custom meta</li>
        <li><strong>Subscribe Pattern:</strong> Reactive route changes</li>
        <li><strong>Semantic HTML:</strong> Standard &lt;a href&gt; links</li>
        <li><strong>AbortSignal:</strong> Cancel in-flight requests</li>
      </ul>
    </div>
  `;
}

function renderAbout(match: RouteMatch) {
  const hash = match.hash;
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="page">
      <h2>About Overhead Router</h2>
      <p>Declarative, type-safe routing for modern web applications.</p>

      <h3>Hash Navigation Demo</h3>
      <div class="tabs">
        <a href="#features" class="${hash === '#features' ? 'active' : ''}">Features</a>
        <a href="#philosophy" class="${hash === '#philosophy' ? 'active' : ''}">Philosophy</a>
        <a href="#performance" class="${hash === '#performance' ? 'active' : ''}">Performance</a>
      </div>

      ${hash === '#features' ? `
        <div class="info-box">
          <h3>✨ Features</h3>
          <ul>
            <li>Declarative route configuration</li>
            <li>Type-safe parameters with TypeScript</li>
            <li>Framework-agnostic design</li>
            <li>Only ~4KB gzipped</li>
            <li>Zero dependencies</li>
          </ul>
        </div>
      ` : ''}

      ${hash === '#philosophy' ? `
        <div class="info-box">
          <h3>🎯 Philosophy</h3>
          <p>Routes should be data, not code. Define what you want, let the router handle how.</p>
        </div>
      ` : ''}

      ${hash === '#performance' ? `
        <div class="info-box">
          <h3>⚡ Performance</h3>
          <ul>
            <li>Route matching: &lt;1ms (cached)</li>
            <li>Native URLPattern API</li>
            <li>Parallel data loading</li>
            <li>Smart prefetching</li>
          </ul>
        </div>
      ` : ''}

      <p style="margin-top: 2rem;"><strong>Notice:</strong> Clicking the hash links updates the URL and content without full navigation!</p>
    </div>
  `;
}

function renderProducts(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.products) {
    app.innerHTML = '<div class="page"><p>No products found.</p></div>';
    return;
  }

  app.innerHTML = `
    <div class="page">
      <h2>Products</h2>
      <p>All products loaded via <code>LoaderContext</code> with <code>signal</code> for cancellation.</p>

      <div class="grid">
        ${data.products.map((p: any) => `
          <div class="card">
            <h3><a href="/products/${p.id}" onmouseenter="router.prefetch('/products/${p.id}')">${p.name}</a></h3>
            <p style="color: #3b82f6; font-weight: 600; margin-top: 0.5rem;">$${p.price}</p>
            <span class="badge">${p.category}</span>
          </div>
        `).join('')}
      </div>

      <div class="info-box" style="margin-top: 2rem;">
        <strong>💡 Hover over product links</strong> to prefetch them for instant navigation!
      </div>
    </div>
  `;
}

function renderProductDetail(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.product) {
    app.innerHTML = '<div class="page"><h2>Product not found</h2><p><a href="/products">← Back to products</a></p></div>';
    return;
  }

  const p = data.product;
  app.innerHTML = `
    <div class="page">
      <p><a href="/products">← Back to Products</a></p>

      <h2 style="margin-top: 1rem;">${p.name}</h2>
      <p style="color: #3b82f6; font-size: 1.5rem; font-weight: 600; margin-top: 0.5rem;">$${p.price}</p>
      <span class="badge">${p.category}</span>

      <p style="margin-top: 1.5rem;">${p.description}</p>

      <div class="success-box" style="margin-top: 2rem;">
        <h3>✅ LoaderContext Demo</h3>
        <p>This product was loaded using:</p>
        <code>loader: async ({ params, signal }) => { ... }</code>
        <p style="margin-top: 0.5rem;">Product ID: <code>${match.params.id}</code></p>
      </div>
    </div>
  `;
}

function renderSearch(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="page">
      <h2>Search Products</h2>
      <p>Demonstrates query parameter handling with <code>LoaderContext.query</code></p>

      <div class="search-box">
        <input type="text" id="search-input" placeholder="Search products..." value="${data?.query || ''}">
        <button id="search-btn">Search</button>
      </div>

      ${data?.results ? `
        <div class="info-box">
          <strong>Query:</strong> <code>${data.query}</code><br>
          <strong>Results:</strong> ${data.results.length} products found
        </div>

        ${data.results.length > 0 ? `
          <div class="grid">
            ${data.results.map((p: any) => `
              <div class="card">
                <h3><a href="/products/${p.id}">${p.name}</a></h3>
                <p style="color: #3b82f6; font-weight: 600;">$${p.price}</p>
              </div>
            `).join('')}
          </div>
        ` : '<p>No products match your search.</p>'}
      ` : '<p>Enter a search query to find products.</p>'}
    </div>
  `;

  // Add search handler
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  searchBtn?.addEventListener('click', () => {
    const query = searchInput.value.trim();
    router.navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  });

  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      router.navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    }
  });
}

function renderUserProfile(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.user) {
    app.innerHTML = '<div class="page"><h2>User not found</h2></div>';
    return;
  }

  const user = data.user;
  app.innerHTML = `
    <div class="page">
      <h2>${user.name}</h2>
      <p>${user.email}</p>
      <span class="badge">${user.role}</span>

      <div class="info-box" style="margin-top: 2rem;">
        <h3>📝 Nested Routes</h3>
        <p>This user has posts. Click to see nested route navigation:</p>
        <ul>
          <li><a href="/users/${user.id}/posts/1">Post 1</a></li>
          <li><a href="/users/${user.id}/posts/2">Post 2</a></li>
          <li><a href="/users/${user.id}/posts/3">Post 3</a></li>
        </ul>
      </div>
    </div>
  `;
}

function renderPost(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.post) {
    app.innerHTML = '<div class="page"><h2>Post not found</h2></div>';
    return;
  }

  const post = data.post;
  app.innerHTML = `
    <div class="page">
      <p><a href="/users/${match.params.userId}">← Back to User Profile</a></p>

      <h2 style="margin-top: 1rem;">${post.title}</h2>
      <p>${post.content}</p>

      <div class="success-box" style="margin-top: 2rem;">
        <h3>🔄 2-Level Nested Route</h3>
        <p>Path: <code>/users/:userId/posts/:postId</code></p>
        <p>User ID: <code>${match.params.userId}</code></p>
        <p>Post ID: <code>${match.params.postId}</code></p>
      </div>

      <div class="info-box" style="margin-top: 1rem;">
        <h3>💬 Go Deeper (3-Level Nesting)</h3>
        <p>Click a comment to see 3-level nested routes:</p>
        <ul>
          <li><a href="/users/${match.params.userId}/posts/${match.params.postId}/comments/1">Comment 1</a></li>
          <li><a href="/users/${match.params.userId}/posts/${match.params.postId}/comments/2">Comment 2</a></li>
        </ul>
      </div>
    </div>
  `;
}

function renderComment(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.comment) {
    app.innerHTML = '<div class="page"><h2>Comment not found</h2></div>';
    return;
  }

  const comment = data.comment;
  app.innerHTML = `
    <div class="page">
      <p><a href="/users/${match.params.userId}/posts/${match.params.postId}">← Back to Post</a></p>

      <h2 style="margin-top: 1rem;">Comment by ${comment.author}</h2>
      <p>${comment.text}</p>

      <div class="success-box" style="margin-top: 2rem;">
        <h3>🎯 3-Level Nested Route!</h3>
        <p>Path: <code>/users/:userId/posts/:postId/comments/:commentId</code></p>
        <p>User ID: <code>${match.params.userId}</code></p>
        <p>Post ID: <code>${match.params.postId}</code></p>
        <p>Comment ID: <code>${match.params.commentId}</code></p>
        <p style="margin-top: 0.5rem;"><strong>All three parameters are type-safe!</strong></p>
      </div>
    </div>
  `;
}

function renderTabs(match: RouteMatch) {
  const hash = match.hash || '#tab1';
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="page">
      <h2>Hash Navigation Demo</h2>
      <p>Hash-only changes update the URL without triggering full navigation.</p>

      <div class="tabs">
        <a href="#tab1" class="${hash === '#tab1' ? 'active' : ''}">Tab 1</a>
        <a href="#tab2" class="${hash === '#tab2' ? 'active' : ''}">Tab 2</a>
        <a href="#tab3" class="${hash === '#tab3' ? 'active' : ''}">Tab 3</a>
      </div>

      ${hash === '#tab1' ? `
        <div class="info-box">
          <h3>Tab 1 Content</h3>
          <p>This is the first tab. Notice the URL hash changes when you click tabs!</p>
        </div>
      ` : ''}

      ${hash === '#tab2' ? `
        <div class="info-box">
          <h3>Tab 2 Content</h3>
          <p>This is the second tab. Hash navigation is handled specially by Overhead Router.</p>
        </div>
      ` : ''}

      ${hash === '#tab3' ? `
        <div class="info-box">
          <h3>Tab 3 Content</h3>
          <p>This is the third tab. No full page navigation occurs!</p>
        </div>
      ` : ''}

      <div class="success-box" style="margin-top: 2rem;">
        <strong>✨ How it works:</strong>
        <p>Hash-only links (like <code>#tab1</code>) are detected and handled specially:</p>
        <ul>
          <li>Updates <code>window.location.hash</code></li>
          <li>Updates <code>match.hash</code> in RouteMatch</li>
          <li>Notifies subscribers with new hash</li>
          <li>Does NOT re-run loaders or guards</li>
          <li>Works with browser back/forward</li>
        </ul>
      </div>
    </div>
  `;
}

function renderAdmin() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="page">
      <div class="success-box">
        <h2>✅ Admin Area</h2>
        <p>You've been authenticated! This route is protected by a guard.</p>
      </div>

      <h3>Admin Navigation</h3>
      <nav style="display: flex; gap: 1rem; margin: 1rem 0;">
        <a href="/admin/dashboard" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.375rem;">Dashboard</a>
        <a href="/admin/users" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.375rem;">Users</a>
      </nav>

      <div class="info-box" style="margin-top: 2rem;">
        <h3>🔒 Route Guard Demo</h3>
        <p>This route uses a <code>guard</code> function:</p>
        <code style="display: block; margin-top: 0.5rem;">guard: () => isAuthenticated</code>
        <p style="margin-top: 0.5rem;">Try logging out and accessing /admin again:</p>
        <button id="logout-btn" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Log Out</button>
      </div>
    </div>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    isAuthenticated = false;
    router.navigate('/admin');
  });
}

function renderAdminDashboard(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.stats) {
    app.innerHTML = '<div class="page"><p>Loading stats...</p></div>';
    return;
  }

  app.innerHTML = `
    <div class="page">
      <p><a href="/admin">← Back to Admin</a></p>

      <h2 style="margin-top: 1rem;">Dashboard</h2>

      <div class="grid" style="margin-top: 1.5rem;">
        <div class="card">
          <h3>Users</h3>
          <p style="font-size: 2rem; font-weight: 600; color: #3b82f6;">${data.stats.users}</p>
        </div>
        <div class="card">
          <h3>Products</h3>
          <p style="font-size: 2rem; font-weight: 600; color: #3b82f6;">${data.stats.products}</p>
        </div>
        <div class="card">
          <h3>Orders</h3>
          <p style="font-size: 2rem; font-weight: 600; color: #3b82f6;">${data.stats.orders}</p>
        </div>
        <div class="card">
          <h3>Revenue</h3>
          <p style="font-size: 2rem; font-weight: 600; color: #10b981;">$${data.stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div class="info-box" style="margin-top: 2rem;">
        <strong>📊 Loaded via nested route loader</strong>
        <p>This is a child route of <code>/admin</code> with its own loader.</p>
      </div>
    </div>
  `;
}

function renderAdminUsers(match: RouteMatch) {
  const data = match.data as any;
  const app = document.getElementById('app')!;

  if (!data?.users) {
    app.innerHTML = '<div class="page"><p>Loading users...</p></div>';
    return;
  }

  app.innerHTML = `
    <div class="page">
      <p><a href="/admin">← Back to Admin</a></p>

      <h2 style="margin-top: 1rem;">User Management</h2>

      <div class="grid" style="margin-top: 1.5rem;">
        ${data.users.map((user: any) => `
          <div class="card">
            <h3>${user.name}</h3>
            <span class="badge">${user.role}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Expose router for debugging
(window as any).router = router;

console.log('🎯 Kitchen Sink initialized! All Overhead Router features demonstrated.');
console.log('Try navigating around and check the console for lifecycle hooks.');
