# Overhead Router

**Declarative, type-safe routing for modern web applications.**

Built for semantic HTML, vanilla TypeScript, and the Overhead framework. Performance-first design with ~4KB gzipped bundle.

## Why Overhead Router?

Modern web frameworks are bloated. You don't need 26KB of routing code. You just need:

- ✅ **Declarative routes** - Configuration over code
- ✅ **Type safety** - Compile-time path validation
- ✅ **Performance** - Native browser APIs, 4KB gzipped
- ✅ **Semantic HTML** - Works with `<a href>` links
- ✅ **Framework agnostic** - Vanilla JS, React, Vue, anything

## Installation

```bash
npm install @overhead/router
```

## Quick Start

```typescript
import { createRouter, route } from '@overhead/router';

// Declarative route definitions
const router = createRouter({
  routes: [
    route('/', {
      component: () => import('./pages/home'),
    }),

    route('/products/:id', {
      component: () => import('./pages/product-detail'),
      loader: async ({ params, signal }) => {
        // Type-safe params with abort support!
        const res = await fetch(`/api/products/${params.id}`, { signal });
        return res.json();
      },
    }),
  ],
});

// That's it! Links work automatically.
```

```html
<!-- Semantic HTML - just works -->
<nav>
  <a href="/">Home</a>
  <a href="/products/123">Product 123</a>
</nav>
```

## Features

### Declarative Configuration

Define routes as pure data:

```typescript
const router = createRouter({
  routes: [
    route('/', { component: () => import('./home') }),
    route('/about', { component: () => import('./about') }),
    route('/products/:id', {
      component: () => import('./product'),
      loader: async ({ params, signal }) => fetchProduct(params.id, { signal }),
      guard: async (params) => checkPermission(params.id),
    }),
  ],
});
```

No imperative code, no side effects—just data.

### Type-Safe Parameters

Path parameters are typed automatically:

```typescript
route('/users/:userId/posts/:postId', {
  loader: async ({ params, query, signal }) => {
    // params.userId: string ✓
    // params.postId: string ✓
    // params.invalid: Error ✗
    // query: URLSearchParams ✓
    // signal: AbortSignal ✓
  },
});
```

### Nested Routes

Compose routes hierarchically:

```typescript
route('/admin', {
  component: () => import('./admin-layout'),
  guard: async () => isAdmin(),
  children: [
    route('/dashboard', { component: () => import('./dashboard') }),
    route('/users', { component: () => import('./users') }),
  ],
});

// Generates: /admin/dashboard, /admin/users
```

### Data Loading

Load data in parallel with components. Loaders receive a context object with params, query, hash, and an abort signal:

```typescript
route('/products/:id', {
  // These run simultaneously!
  component: () => import('./product-detail'),
  loader: async ({ params, query, signal }) => {
    // Access path params
    const id = params.id;

    // Access query params
    const category = query.get('category');

    // Use abort signal for cancellation
    const res = await fetch(`/api/products/${id}`, { signal });
    return res.json();
  },
});
```

### Route Guards

Declarative authorization:

```typescript
route('/admin', {
  guard: async () => {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  },
  component: () => import('./admin'),
});
```

### Navigation Hooks

Global lifecycle hooks:

```typescript
createRouter({
  routes: [...],
  hooks: {
    beforeNavigate: async (path) => {
      console.log('Navigating to:', path);
      return true; // or false to block
    },
    afterNavigate: async (path) => {
      // Update analytics, document title, etc.
    },
  },
});
```

## API Reference

### `createRouter(config)`

Create a router instance.

```typescript
const router = createRouter({
  routes: Route[],           // Route definitions
  base?: string,             // Base path (default: '')
  notFound?: () => void,     // 404 handler
  unauthorized?: () => void, // Guard failure handler
  onError?: (e: Error) => void,
  hooks?: {
    beforeNavigate?: (path: string) => boolean | Promise<boolean>,
    afterNavigate?: (path: string) => void | Promise<void>,
  },
  ssr?: boolean,             // SSR mode - skips browser API setup (default: false)
});
```

### `route(path, config)`

Define a type-safe route.

```typescript
route('/users/:id', {
  component: () => Promise<any> | any,
  loader?: (context: LoaderContext) => Promise<any> | any,
  guard?: (params) => boolean | Promise<boolean>,
  children?: Route[],
  meta?: Record<string, any>,
});
```

**LoaderContext:**
```typescript
{
  params: ExtractParams<Path>,  // Path parameters
  query: URLSearchParams,        // Query parameters
  hash: string,                  // URL hash
  signal: AbortSignal,           // For cancellation
}
```

### `router.navigate(path, options?)`

Navigate programmatically.

```typescript
await router.navigate('/products/123', {
  replace: false,  // Replace history entry
  scroll: true,    // Scroll to top
  state: {},       // Custom state
});
```

### `router.subscribe(listener)`

Subscribe to route changes.

```typescript
const unsubscribe = router.subscribe((match) => {
  console.log('Current route:', match?.route.path);
  console.log('Params:', match?.params);
  console.log('Query:', Object.fromEntries(match?.query || []));
  console.log('Hash:', match?.hash);
  console.log('Data:', match?.data); // Loaded data from route.loader()
});

// Clean up
unsubscribe();
```

### `router.prefetch(path)`

Preload a route's component for instant navigation.

```typescript
// Prefetch on hover
link.addEventListener('mouseenter', () => {
  router.prefetch('/products/123');
});
```

### `router.getBreadcrumbs()`

Generate breadcrumbs for the current route by walking the route tree.

```typescript
const breadcrumbs = router.getBreadcrumbs();
// [{ path: '/admin', title: 'Admin' }, { path: '/admin/users', title: 'Users' }]
```

### `router.getCurrentMatch()`

Get current route match.

```typescript
const match = router.getCurrentMatch();
if (match) {
  console.log(match.route.path);
  console.log(match.params);
  console.log(match.query);
  console.log(match.data); // Loaded data if loader exists
}
```

### `router.destroy()`

Clean up router and remove all event listeners. Important for preventing memory leaks.

```typescript
// When done with router (e.g., unmounting app)
router.destroy();
```

## Utilities

### Type-Safe URL Building

```typescript
import { buildUrl } from '@overhead/router/utils';

// With path params
buildUrl('/products/:id', { id: '123' });
// → /products/123

// With query params
buildUrl('/products', {}, { category: 'electronics', sort: 'price' });
// → /products?category=electronics&sort=price
```

### Route Prefetching

```typescript
import { createPrefetchHandler } from '@overhead/router/utils';

// Prefetch on hover for instant navigation
const prefetch = createPrefetchHandler(router);
document.addEventListener('mouseenter', prefetch, true);
```

### Active Link Styling

```typescript
import { getActiveClass } from '@overhead/router/utils';

const currentPath = router.getCurrentMatch()?.path;
const linkClass = getActiveClass(currentPath, '/products', 'active');
// → 'active' if current path is /products
```

## Examples

### Vanilla TypeScript

```typescript
import { createRouter, route } from '@overhead/router';

const router = createRouter({
  routes: [
    route('/', {
      component: () => {
        document.getElementById('app')!.innerHTML = '<h1>Home</h1>';
      },
    }),
    route('/about', {
      component: () => {
        document.getElementById('app')!.innerHTML = '<h1>About</h1>';
      },
    }),
  ],
});
```

### With Data Loading

```typescript
route('/products/:id', {
  loader: async ({ params, query, signal }) => {
    const category = query.get('category') || 'all';
    const res = await fetch(`/api/products/${params.id}?category=${category}`, { signal });
    return res.json();
  },
  component: async () => {
    const ProductDetail = await import('./product-detail');
    return ProductDetail;
  },
});

// Access loaded data in your subscribe handler
router.subscribe((match) => {
  if (match?.route.path === '/products/:id') {
    // Data is already loaded and available in match.data
    const data = match.data;
    // Render with data
  }
});
```

### With React

```typescript
import { createRouter, route } from '@overhead/router';
import { useState, useEffect } from 'react';

const router = createRouter({
  routes: [
    route('/', { component: () => import('./pages/Home') }),
    route('/about', { component: () => import('./pages/About') }),
  ],
});

function App() {
  const [match, setMatch] = useState(router.getCurrentMatch());

  useEffect(() => {
    return router.subscribe(setMatch);
  }, []);

  return <div>{/* Render based on match */}</div>;
}
```

### Authentication Guards

```typescript
route('/dashboard', {
  guard: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const user = await verifyToken(token);
    return Boolean(user);
  },
  component: () => import('./dashboard'),
});

createRouter({
  routes: [...],
  unauthorized: () => {
    // Redirect to login
    router.navigate('/login');
  },
});
```

### Nested Layouts

```typescript
route('/dashboard', {
  component: () => import('./layouts/dashboard-layout'),
  children: [
    route('/overview', { component: () => import('./overview') }),
    route('/analytics', { component: () => import('./analytics') }),
    route('/settings', { component: () => import('./settings') }),
  ],
});

// URLs: /dashboard/overview, /dashboard/analytics, /dashboard/settings
```

## Performance

- **Bundle size:** ~4KB gzipped
- **Route matching:** <1ms (LRU cached, O(1) for last 10 routes)
- **Navigation:** <100ms (excluding network)
- **Zero dependencies**
- **Native browser APIs** (URLPattern, History API)

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed benchmarks.

## Browser Support

- **Modern browsers:** Full support (Chrome 95+, Edge 95+, Safari 16.4+, Firefox 120+)
- **Fallback:** Regex-based routing for older browsers
- **Progressive enhancement:** Works without JavaScript (with server-side routing)

## Philosophy

1. **Declarative over imperative** - Routes are data, not code
2. **Type-safe by default** - Catch errors at compile time
3. **Performance first** - Native APIs, minimal bundle
4. **Semantic HTML** - Standard `<a>` links work
5. **Framework agnostic** - Works anywhere JavaScript runs
6. **Progressive enhancement** - Graceful degradation without JS

## Comparison

| Feature | Overhead Router | React Router | Navigo |
|---------|-----------------|--------------|--------|
| Bundle size | 4KB | 26KB | 4KB |
| TypeScript | ✓ Full | ✓ Full | Partial |
| Type-safe params | ✓ | ✓ (v7) | ✗ |
| Declarative | ✓ | ✓ | Partial |
| Framework-agnostic | ✓ | React only | ✓ |
| Data loading | ✓ | ✓ | ✗ |
| Route guards | ✓ | ✓ | ✓ |
| Nested routes | ✓ | ✓ | ✗ |
| Dependencies | 0 | 2 | 0 |

## License

MIT

## Contributing

Contributions welcome! Please open an issue or pull request on GitHub.

## Why "Overhead"?

Part of the Overhead framework - a collection of minimal, performance-first tools for modern web development. Because great apps shouldn't require massive frameworks. No bloat, no magic, just the essentials.
