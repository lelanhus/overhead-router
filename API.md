# API Reference

Complete API documentation for Overhead Router v1.0.0.

## Router Creation

### `createRouter(config: RouterConfig): Router`

Creates and initializes a router instance.

```typescript
const router = createRouter({
  routes: [
    route('/', { component: () => import('./home') }),
    route('/users/:id', { component: () => import('./user') })
  ],
  base: '/app',
  notFound: () => console.log('404'),
  onError: (error) => console.error(error),
  ssr: false
});
```

**Parameters:**
- `config.routes` - Array of route definitions (required)
- `config.base` - Base path prefix (default: `''`)
- `config.notFound` - 404 handler function
- `config.unauthorized` - Guard failure handler
- `config.onError` - Error handler for navigation errors
- `config.hooks` - Lifecycle hooks (beforeNavigate, afterNavigate)
- `config.ssr` - SSR mode, skips browser API setup (default: `false`)

**Returns:** Router instance

---

### `route<Path>(path: Path, config): Route<Path>`

Type-safe route definition helper.

```typescript
route('/users/:userId/posts/:postId', {
  component: () => import('./post'),
  loader: async ({ params, query, signal }) => {
    const res = await fetch(`/api/users/${params.userId}/posts/${params.postId}`, { signal });
    return res.json();
  },
  guard: (params) => checkPermission(params.userId),
  meta: { title: 'Post Detail' },
  children: [...]
});
```

**Parameters:**
- `path` - URL pattern with `:param` syntax
- `config.component` - Component loader function (required)
- `config.loader` - Data loader function
- `config.guard` - Authorization guard function
- `config.children` - Nested routes
- `config.meta` - Arbitrary metadata

**Returns:** Typed route definition

---

## Router Instance Methods

### `router.navigate(path: string, options?: NavigateOptions): Promise<void>`

Navigate to a path programmatically.

```typescript
await router.navigate('/products/123', {
  replace: false,
  scroll: true,
  state: { from: '/home' }
});
```

**Parameters:**
- `path` - Destination path (excluding base)
- `options.replace` - Replace current history entry (default: `false`)
- `options.scroll` - Scroll to top after navigation (default: `true`)
- `options.state` - Custom state object for history.state

**Returns:** Promise that resolves when navigation completes

**Behavior:**
- Updates browser history
- Triggers route matching
- Runs guards and loaders
- Notifies subscribers
- Scrolls to top (unless disabled)

---

### `router.subscribe(listener: (match: RouteMatch | null) => void): () => void`

Subscribe to route changes.

```typescript
const unsubscribe = router.subscribe((match) => {
  if (match) {
    console.log('Route:', match.route.path);
    console.log('Params:', match.params);
    console.log('Query:', match.query);
    console.log('Hash:', match.hash);
    console.log('Data:', match.data);
  }
});

// Later: cleanup
unsubscribe();
```

**Parameters:**
- `listener` - Function called on route changes

**Returns:** Unsubscribe function

**Behavior:**
- Immediately calls listener with current match
- Calls listener on every subsequent navigation
- Listener receives `null` for 404 routes

---

### `router.getCurrentMatch(): RouteMatch | null`

Get current route match synchronously.

```typescript
const match = router.getCurrentMatch();
if (match) {
  console.log('Current path:', match.path);
}
```

**Returns:** Current route match or `null` if no route matched

---

### `router.prefetch(path: string): Promise<void>`

Preload a route's component for instant navigation.

```typescript
// Prefetch on hover
link.addEventListener('mouseenter', () => {
  router.prefetch('/products/123');
});
```

**Parameters:**
- `path` - Route path to prefetch

**Returns:** Promise that resolves when component is loaded

**Behavior:**
- Matches route to find component
- Preloads component module
- Does NOT run loaders or guards
- Fails silently if route not found

---

### `router.getBreadcrumbs(): Array<{ path: string; title: string }>`

Generate breadcrumbs for current route.

```typescript
const breadcrumbs = router.getBreadcrumbs();
// [
//   { path: '/admin', title: 'Admin' },
//   { path: '/admin/users', title: 'Users' },
//   { path: '/admin/users/123', title: '123' }
// ]
```

**Returns:** Array of breadcrumb objects

**Behavior:**
- Walks path segments from root to current
- Looks up matching routes for each segment
- Uses `route.meta.title` if available
- Falls back to path segment as title

---

### `router.destroy(): void`

Clean up router and remove all event listeners.

```typescript
// On unmount
router.destroy();
```

**Behavior:**
- Removes click event listener
- Removes popstate event listener
- Removes hashchange event listener
- Clears all subscribers
- Aborts in-flight navigation

**Important:** Always call when router is no longer needed to prevent memory leaks.

---

## Route Configuration

### LoaderContext

Context object passed to route loaders.

```typescript
interface LoaderContext<Path extends string> {
  params: ExtractParams<Path>;  // Path parameters
  query: URLSearchParams;        // Query parameters
  hash: string;                  // URL hash
  signal: AbortSignal;           // Abort signal
}
```

**Usage in loaders:**

```typescript
route('/products/:id', {
  loader: async ({ params, query, hash, signal }) => {
    // Access path param
    const id = params.id;

    // Access query param
    const category = query.get('category');

    // Check hash
    if (hash === '#reviews') { ... }

    // Use abort signal
    const res = await fetch(`/api/products/${id}`, { signal });
    return res.json();
  }
});
```

**Fields:**

#### `params: ExtractParams<Path>`
Path parameters extracted from URL. Type-safe based on route pattern.

```typescript
// Route: '/users/:userId/posts/:postId'
// URL: '/users/123/posts/456'
// params = { userId: '123', postId: '456' }
```

#### `query: URLSearchParams`
Query parameters from URL search string.

```typescript
// URL: '/products?category=electronics&sort=price'
query.get('category')  // 'electronics'
query.get('sort')      // 'price'
query.getAll('tag')    // ['tag1', 'tag2']
```

#### `hash: string`
URL hash including `#` symbol.

```typescript
// URL: '/docs#api-reference'
hash  // '#api-reference'
```

#### `signal: AbortSignal`
Signal for aborting async operations.

```typescript
loader: async ({ params, signal }) => {
  const res = await fetch(`/api/data/${params.id}`, { signal });

  // Check if aborted
  if (signal.aborted) {
    return null;
  }

  return res.json();
}
```

When navigation is cancelled (user navigates away), signal aborts automatically.

---

## Utility Functions

### `buildPath<Path>(path: Path, params: ExtractParams<Path>): string`

Build URL from path template and parameters.

```typescript
buildPath('/users/:id', { id: '123' });
// '/users/123'

buildPath('/users/:userId/posts/:postId', { userId: '1', postId: '2' });
// '/users/1/posts/2'

buildPath('/home', {});
// '/home'
```

**Type Safety:**
```typescript
buildPath('/users/:id', { id: '123' });        // ✓
buildPath('/users/:id', { userId: '123' });    // ✗ TypeScript error
buildPath('/users/:id', {});                   // ✗ TypeScript error
```

---

### `buildUrl<Path>(path: Path, params: ExtractParams<Path>, query?: Record<string, string | number | boolean | undefined>): string`

Build complete URL with path params and query params.

```typescript
buildUrl('/products/:id', { id: '123' }, { category: 'electronics', sort: 'price' });
// '/products/123?category=electronics&sort=price'

buildUrl('/products/:id', { id: '123' });
// '/products/123'
```

**Parameters:**
- `path` - Path template
- `params` - Path parameters
- `query` - Query parameters (optional)

**Behavior:**
- Undefined query values are omitted
- Values converted to strings automatically

---

### `buildQuery(params: Record<string, string | number | boolean | undefined>): string`

Build query string from object.

```typescript
buildQuery({ category: 'electronics', page: 2, active: true });
// '?category=electronics&page=2&active=true'

buildQuery({ category: 'electronics', page: undefined });
// '?category=electronics'

buildQuery({});
// ''
```

---

### `createPrefetchHandler(router: { prefetch: (path: string) => Promise<void> }): (e: MouseEvent) => void`

Create mouseover handler for link prefetching.

```typescript
const prefetch = createPrefetchHandler(router);

// Delegate
document.addEventListener('mouseover', prefetch, true);

// Or per-link
link.addEventListener('mouseenter', prefetch);
```

**Behavior:**
- Finds closest `<a href>` element
- Prefetches route on first hover
- Tracks prefetched routes (won't prefetch twice)

---

### `pathMatches(currentPath: string, pattern: string, exact?: boolean): boolean`

Check if path matches pattern.

```typescript
pathMatches('/products/123', '/products', false);  // true (prefix match)
pathMatches('/products/123', '/products', true);   // false (exact match)
pathMatches('/products', '/products', true);       // true (exact match)
```

---

### `getActiveClass(currentPath: string, linkPath: string, activeClass?: string, exact?: boolean): string`

Get CSS class for active links.

```typescript
const currentPath = '/products/123';

getActiveClass(currentPath, '/products');
// 'active' (default class, prefix match)

getActiveClass(currentPath, '/products', 'is-active');
// 'is-active'

getActiveClass(currentPath, '/products', 'active', true);
// '' (exact match failed)
```

---

### `createRouteBuilder<TRoutes>(routes: TRoutes, router?: Router)`

Create type-safe route builder utility.

```typescript
const routes = [
  route('/products/:id', { component: () => import('./product') }),
  route('/users/:userId', { component: () => import('./user') })
] as const;

const builder = createRouteBuilder(routes, router);

// Type-safe navigation
await builder.navigate('/products/:id', { id: '123' });

// Type-safe link generation
const url = builder.link('/products/:id', { id: '123' });
// '/products/123'

// With query
const urlWithQuery = builder.linkWithQuery('/products/:id', { id: '123' }, { sort: 'price' });
// '/products/123?sort=price'

// All paths
builder.paths;
// ['/products/:id', '/users/:userId']

// Check path exists
builder.hasPath('/products/:id');  // true
```

---

## Type Definitions

### RouteMatch

Result of matching URL to route.

```typescript
interface RouteMatch<Path extends string, TData = unknown> {
  route: Route<Path>;
  params: ExtractParams<Path>;
  query: URLSearchParams;
  hash: string;
  path: string;
  data?: TData;
}
```

---

### NavigationError

Discriminated union for error handling.

```typescript
type NavigationError =
  | { type: 'not-found'; path: string }
  | { type: 'unauthorized'; path: string; route: Route }
  | { type: 'guard-failed'; path: string; route: Route }
  | { type: 'loader-error'; error: Error; route: Route }
  | { type: 'component-error'; error: Error; route: Route }
  | { type: 'navigation-aborted'; path: string }
  | { type: 'unknown'; error: Error };
```

**Usage:**
```typescript
onError: (error) => {
  switch (error.type) {
    case 'not-found':
      render404(error.path);
      break;
    case 'loader-error':
      console.error('Loader failed:', error.error);
      break;
  }
}
```

---

## Hooks

### beforeNavigate

Called before navigation starts. Can block navigation by returning `false`.

```typescript
createRouter({
  routes: [...],
  hooks: {
    beforeNavigate: async (path) => {
      console.log('Navigating to:', path);

      // Block navigation
      if (path.startsWith('/admin') && !isAdmin()) {
        return false;
      }

      return true;  // Allow navigation
    }
  }
});
```

---

### afterNavigate

Called after navigation completes successfully.

```typescript
createRouter({
  routes: [...],
  hooks: {
    afterNavigate: async (path) => {
      // Update analytics
      analytics.track('pageview', path);

      // Update document title
      document.title = getTitleForPath(path);
    }
  }
});
```

---

## Click Interception

Router automatically intercepts clicks on `<a>` links with the following guards:

**Intercepted:**
- Internal links (`href="/products/123"`)
- Left-click only
- No modifier keys (Ctrl, Cmd, Shift, Alt)
- No `target` attribute or `target="_self"`
- No `download` attribute
- Same origin
- Not marked with `data-external`

**Not intercepted:**
- External links
- Ctrl+Click / Cmd+Click (opens new tab)
- Right-click (shows context menu)
- Middle-click
- Links with `target="_blank"`
- Download links
- Links marked `data-external`
- Hash-only links (`href="#section"`)

**Force external behavior:**
```html
<a href="/products/123" data-external>External</a>
```

---

## Hash Navigation

Hash-only changes (`#section1` → `#section2`) are handled specially:

**Behavior:**
- Updates `window.location.hash`
- Updates `match.hash` in current RouteMatch
- Notifies subscribers with updated match
- Does NOT re-run loaders or guards
- Does NOT rematch route
- Browser handles scrolling automatically
- Works with browser back/forward

**Example:**
```html
<a href="#reviews">Reviews</a>
<a href="#specifications">Specs</a>
```

Clicking these updates hash without full navigation.

---

## SSR Mode

Disable browser API setup for server-side rendering:

```typescript
const router = createRouter({
  routes: [...],
  ssr: true
});

// No click listeners attached
// No popstate listeners attached
// No initial navigation
```

Use for:
- Server-side rendering
- Static site generation
- Node.js environments
- Testing

---

## Performance Notes

| Operation | Complexity | Details |
|-----------|-----------|---------|
| Route matching (cached) | O(1) | LRU cache, last 10 routes |
| Route matching (uncached) | O(n) | Linear scan of routes |
| Navigation | O(1) + loader time | Excluding network |
| Subscribe | O(1) | Add to Set |
| Notify | O(s) | s = subscriber count |

**Optimizations:**
- Routes compiled once at initialization
- LRU cache for repeated navigations
- Parallel component/loader execution
- Single delegated click listener
- Lazy component imports
- Abortable navigations (prevents race conditions)
