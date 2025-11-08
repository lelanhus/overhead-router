import { createRouter, route } from '@overhead/router';

// Mock product data
const products = [
  { id: 1, name: 'Laptop Pro', price: 1299, category: 'Electronics', description: 'High-performance laptop for professionals' },
  { id: 2, name: 'Wireless Mouse', price: 29, category: 'Accessories', description: 'Ergonomic wireless mouse with precision tracking' },
  { id: 3, name: 'Mechanical Keyboard', price: 149, category: 'Accessories', description: 'Premium mechanical keyboard with RGB lighting' },
  { id: 4, name: 'USB-C Hub', price: 79, category: 'Accessories', description: '7-in-1 USB-C hub with multiple ports' },
  { id: 5, name: 'Monitor 27"', price: 399, category: 'Electronics', description: '4K UHD monitor with HDR support' },
  { id: 6, name: 'Webcam HD', price: 89, category: 'Electronics', description: '1080p webcam with noise cancellation' }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create router with routes
const router = createRouter({
  routes: [
    // Home page
    route('/', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'Home' },
      loader: async () => {
        await delay(300);
        return {
          message: 'Welcome to Overhead Router',
          features: [
            'Type-safe routing',
            'Dynamic route parameters',
            'Data loading with loaders',
            'Navigation guards',
            'Client-side navigation'
          ]
        };
      }
    }),

    // Products list
    route('/products', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'Products' },
      loader: async ({ signal }) => {
        await delay(500);

        // Check if request was aborted
        if (signal?.aborted) {
          throw new Error('Request aborted');
        }

        return {
          products,
          total: products.length
        };
      }
    }),

    // Product detail with dynamic parameter
    route('/products/:id', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'Product Detail' },
      loader: async ({ params, signal }) => {
        await delay(400);

        if (signal?.aborted) {
          throw new Error('Request aborted');
        }

        const productId = parseInt(params.id as string, 10);
        const product = products.find(p => p.id === productId);

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        return { product };
      }
    }),

    // About page
    route('/about', {
      component: () => Promise.resolve(() => {}),
      meta: { title: 'About' },
      loader: async () => {
        await delay(200);
        return {
          title: 'About Overhead Router',
          description: 'A type-safe, framework-agnostic router for the Overhead framework.',
          version: '1.0.0'
        };
      }
    })
  ],

  base: '',

  notFound: () => {
    renderNotFound();
  },

  hooks: {
    beforeNavigate: async (path) => {
      console.log('Navigating to:', path);
      return true;
    },
    afterNavigate: async (path) => {
      console.log('Navigated to:', path);
      updateActiveNavLink(path);
    }
  }
});

// Get DOM elements
const app = document.getElementById('app')!;

// Subscribe to route changes and render
router.subscribe((match) => {
  if (!match) {
    renderNotFound();
    return;
  }

  const { route: currentRoute, params, query, data } = match;

  // Update page title
  if (currentRoute.meta?.title) {
    document.title = `${currentRoute.meta.title} - Overhead Router`;
  }

  // Render based on route path
  switch (currentRoute.path) {
    case '/':
      renderHome(data);
      break;
    case '/products':
      renderProducts(data);
      break;
    case '/products/:id':
      renderProductDetail(data, params);
      break;
    case '/about':
      renderAbout(data);
      break;
    default:
      renderNotFound();
  }
});

// Render functions
function renderHome(data: any) {
  app.innerHTML = `
    <h1>${data.message}</h1>
    <p>This is a vanilla TypeScript example demonstrating the core features of Overhead Router.</p>

    <h2>Key Features:</h2>
    <ul>
      ${data.features.map((f: string) => `<li>${f}</li>`).join('')}
    </ul>

    <p style="margin-top: 20px;">
      Check out the <a href="/products">Products page</a> to see dynamic routing and data loading in action.
    </p>
  `;

  setupLinkHandlers();
}

function renderProducts(data: any) {
  app.innerHTML = `
    <h1>Products</h1>
    <p>Total products: ${data.total}</p>

    <div class="product-list">
      ${data.products.map((product: any) => `
        <div class="product-card">
          <h3><a href="/products/${product.id}">${product.name}</a></h3>
          <p>${product.description}</p>
          <p><strong>$${product.price}</strong></p>
          <p><small>${product.category}</small></p>
        </div>
      `).join('')}
    </div>
  `;

  setupLinkHandlers();
}

function renderProductDetail(data: any, params: any) {
  const { product } = data;

  app.innerHTML = `
    <h1>${product.name}</h1>

    <dl class="product-detail">
      <dt>Price:</dt>
      <dd>$${product.price}</dd>

      <dt>Category:</dt>
      <dd>${product.category}</dd>

      <dt>Description:</dt>
      <dd>${product.description}</dd>

      <dt>Product ID:</dt>
      <dd><code>${params.id}</code></dd>
    </dl>

    <p style="margin-top: 30px;">
      <a href="/products">&larr; Back to products</a>
    </p>
  `;

  setupLinkHandlers();
}

function renderAbout(data: any) {
  app.innerHTML = `
    <h1>${data.title}</h1>
    <p>${data.description}</p>

    <h2>Version</h2>
    <p><code>${data.version}</code></p>

    <h2>Features in this example:</h2>
    <ul>
      <li>Client-side routing with vanilla TypeScript</li>
      <li>Dynamic route parameters (<code>/products/:id</code>)</li>
      <li>Data loading with async loaders</li>
      <li>Simulated API calls with loading states</li>
      <li>Navigation hooks (beforeNavigate, afterNavigate)</li>
      <li>404 handling</li>
    </ul>

    <h2>Tech Stack</h2>
    <ul>
      <li>TypeScript</li>
      <li>Vite</li>
      <li>Overhead Router ${data.version}</li>
    </ul>
  `;

  setupLinkHandlers();
}

function renderNotFound() {
  app.innerHTML = `
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <p><a href="/">Go to home page</a></p>
  `;

  setupLinkHandlers();
}

// Setup link click handlers for client-side navigation
function setupLinkHandlers() {
  app.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (href) {
        router.navigate(href);
      }
    });
  });
}

// Update active nav link styling
function updateActiveNavLink(path: string) {
  const nav = document.getElementById('nav')!;
  nav.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (href === '/products' && path.startsWith('/products/'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Setup navigation links in header
document.getElementById('nav')!.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    e.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
      router.navigate(href);
    }
  }
});

console.log('Overhead Router example initialized');
