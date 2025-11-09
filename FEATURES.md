# sane-router: Platform-First Features

## Overview

sane-router is a declarative, type-safe routing library designed for modern web applications. It leverages cutting-edge browser APIs while providing graceful fallbacks for broader compatibility.

**Bundle Size**: ~4KB gzipped (< 5KB budget, entire router + utilities)
**Browser Support**: Chrome 95+, Safari 16.4+ (URLPattern), Firefox 120+, Safari 18+ (View Transitions)
**Node**: 18.0.0+

## Core Features

### 1. E2E Type Safety

Template literal types extract route parameters at compile-time:

```typescript
const routes = {
  user: route({
    path: '/users/:userId/posts/:postId',
    loader: async ({ params }) => {
      // params is typed as: { userId: string; postId: string }
      return fetchPost(params.userId, params.postId);
    }
  })
} as const;

// Type-safe navigation
router.navigate('/users/123/posts/456');

// Type narrowing with matchesRoute()
const match = router.getCurrentMatch();
if (matchesRoute(match, routes.user)) {
  match.data; // Fully typed as return type of loader
  match.params.userId; // string
}
```

### 2. Route Registry Pattern

Organize routes in typed registries for autocomplete and refactoring:

```typescript
import { createRouteRegistry } from '@overhead/router';

const routes = createRouteRegistry({
  home: route({ path: '/', component: () => import('./pages/home') }),
  products: route({ path: '/products/:id', loader: loadProduct }),
  admin: route({ path: '/admin', guard: checkAuth })
});

// Type-safe access
router.navigate(routes.products.path); // Autocomplete!
```

### 3. Enhanced Guards

Guards can return rich objects for redirects and context passing:

```typescript
route({
  path: '/dashboard',
  guard: async (params) => {
    const user = await getUser();

    if (!user) {
      return { redirect: '/login', replace: true };
    }

    if (!user.isPremium) {
      return { deny: true, reason: 'Premium required' };
    }

    // Pass context to loader
    return { allow: true, context: { user } };
  },
  loader: async ({ context }) => {
    // context is the user object from guard
    return fetchDashboard(context.user);
  }
})
```

### 4. Programmatic Redirects

Loaders can throw redirects for cleaner error handling:

```typescript
import { redirect } from '@overhead/router';

route({
  path: '/products/:id',
  loader: async ({ params }) => {
    const product = await fetchProduct(params.id);

    if (!product) {
      redirect('/404'); // Throws RedirectResponse
    }

    if (product.archived) {
      redirect(`/products/${product.newId}`, true);
    }

    return product;
  }
})
```

### 5. Configurable Cache Strategies

Control caching behavior per-route or globally:

```typescript
const router = createRouter({
  routes,
  cache: {
    strategy: 'params', // Default: re-load on query/hash change
    maxSize: 10,
    maxAge: Infinity
  }
});

// Per-route overrides
route({
  path: '/search',
  cache: { strategy: 'query', maxAge: 60000 }, // Cache includes query for 1min
  loader: async ({ query }) => search(query.get('q'))
});

route({
  path: '/dashboard/live',
  cache: false, // Never cache
  loader: async () => fetchLiveData()
});

// Cache strategies:
// - 'params': Cache by path only (default)
// - 'query': Cache by path + query
// - 'full': Cache by path + query + hash
// - false: No caching
```

### 6. View Transitions API

Smooth cross-fade animations between route changes (enabled by default):

```typescript
const router = createRouter({
  routes,
  viewTransitions: true // Default: true
});
```

Customize transitions with CSS:

```css
/* Fade entire page */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* Slide specific elements */
.header {
  view-transition-name: header;
}

::view-transition-old(header) {
  animation: slide-out 0.3s;
}

::view-transition-new(header) {
  animation: slide-in 0.3s;
}
```

**Browser Support**: Chrome 111+, Edge 111+, Safari 18+
**Fallback**: Instant transitions on unsupported browsers

### 7. Navigation API (Experimental)

Opt-in to the modern Navigation API for better programmatic control:

```typescript
const router = createRouter({
  routes,
  useNavigationAPI: true // Default: false (opt-in)
});
```

**Benefits**:
- More robust navigation state management
- Better integration with browser back/forward
- Future-proof for upcoming browser features

**Browser Support**: Chrome 102+, Edge 102+, Opera 88+
**NOT supported**: Safari, Firefox (as of Nov 2025)
**Fallback**: Automatic fallback to History API

## Configuration Options

```typescript
interface RouterConfig {
  routes: Route[];
  base?: string;
  notFound?: () => void | Promise<void>;
  unauthorized?: () => void | Promise<void>;
  onError?: (error: NavigationError) => void;

  hooks?: {
    beforeNavigate?: (path: string) => boolean | Promise<boolean>;
    afterNavigate?: (path: string) => void | Promise<void>;
  };

  ssr?: boolean; // SSR mode - skip browser APIs
  viewTransitions?: boolean; // Enable View Transitions (default: true)
  useNavigationAPI?: boolean; // Use Navigation API (default: false)

  cache?: {
    strategy?: 'params' | 'query' | 'full' | false;
    maxSize?: number;
    maxAge?: number;
  };
}
```

## Migration from v0.x

### Guard Return Types

**Before (v0.x)**:
```typescript
guard: (params) => {
  if (!isAuthed()) return false;
  return true;
}
```

**After (v1.0)**:
```typescript
guard: (params) => {
  if (!isAuthed()) {
    return { redirect: '/login' }; // Redirect instead of deny
  }
  return { allow: true, context: { user } }; // Pass context
}

// Backward compatible: boolean return still works
guard: (params) => isAuthed()
```

### Loader Context

**Before (v0.x)**:
```typescript
loader: async (params) => {
  return fetchData(params.id);
}
```

**After (v1.0)**:
```typescript
loader: async ({ params, query, hash, signal, context }) => {
  // Structured context with abort signal
  return fetchData(params.id, { signal });
}
```

## Performance

- **Route Matching**: <1ms for 100 routes (cached: <0.01ms)
- **Bundle Size**: ~4KB gzipped (minified + tree-shaken, < 5KB budget)
- **First Load**: ~2ms initialization
- **Navigation**: <5ms (loader dependent)

## TypeScript Support

Requires TypeScript 5.9+ for template literal type inference.

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "NodeNext",
    "exactOptionalPropertyTypes": true
  }
}
```

## Platform Requirements

### Required APIs
- ES2022 features
- URLPattern (with RegExp fallback)
- History API
- AbortController

### Optional APIs (with fallbacks)
- View Transitions API
- Navigation API

### Polyfills
None required for target browsers. For older browsers, add:
- URLPattern polyfill
- AbortController polyfill (pre-2018 browsers)
