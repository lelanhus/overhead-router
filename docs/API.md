# API Reference

Complete API documentation for @overhead/router v1.0.0.

> **Note:** This is a quick reference guide. For the most up-to-date and comprehensive documentation, see the TypeScript definitions and JSDoc comments in `src/router/types/*.ts`.

## Table of Contents
- [Router Creation](#router-creation)
- [Router Methods](#router-methods)
- [Route Configuration](#route-configuration)
- [Utilities](#utilities)
- [Type Definitions](#type-definitions)

## Router Creation

### `createRouter(config: RouterConfig): Router`

Creates and initializes a router instance with full type safety and browser API integration.

**Complete RouterConfig interface:**
```typescript
interface RouterConfig {
  routes: ReadonlyArray<Route>;           // Route definitions (required)
  base?: string;                          // Base path prefix (default: '')
  notFound?: () => void | Promise<void>;  // 404 handler
  unauthorized?: () => void | Promise<void>; // Guard failure handler
  onError?: (error: NavigationError) => void; // Error handler
  hooks?: {
    beforeNavigate?: (path: string) => boolean | Promise<boolean>;
    afterNavigate?: (path: string) => void | Promise<void>;
  };
  ssr?: boolean;                          // SSR mode (default: false)
  viewTransitions?: boolean;              // Enable View Transitions API (default: true)
  useNavigationAPI?: boolean;             // Enable Navigation API (default: false, experimental)
  cache?: {
    strategy?: 'params' | 'query' | 'full' | false; // Default: 'params'
    maxSize?: number;                     // LRU cache size (default: 10)
    maxAge?: number;                      // TTL in ms (default: Infinity)
  };
}
```

### `route(config): Route` (New API)

Type-safe route definition with single config object:

```typescript
route({
  path: '/products/:id',
  component: () => import('./product'),
  loader: async ({ params, query, hash, signal, context }) => {
    const res = await fetch(`/api/products/${params.id}`, { signal });
    return res.json();
  },
  guard: (params) => checkPermission(params.id),
  children: [...],
  meta: { title: 'Product' },
  cache: { strategy: 'query', maxAge: 60000 }
});
```

### `route(path, config): Route` (Legacy API)

Backward-compatible two-parameter API:

```typescript
route('/products/:id', {
  component: () => import('./product'),
  loader: async ({ params }) => fetchProduct(params.id)
});
```

## Router Methods

### `router.navigate(path: string, options?: NavigateOptions): Promise<void>`

Navigate programmatically with optional state and behavior control.

```typescript
await router.navigate('/products/123', {
  replace: false,  // Replace history entry (default: false)
  scroll: true,    // Scroll to top (default: true)
  state: {}        // Custom history state
});
```

### `router.match(path: string, options?: { search?: string; hash?: string }): RouteMatch | null`

Match a path without navigating. Useful for SSR, testing, and programmatic route matching.

```typescript
const match = router.match('/products/123', {
  search: '?category=electronics',
  hash: '#reviews'
});
```

### `router.subscribe(listener: (match: RouteMatch | null) => void): () => void`

Subscribe to route changes with automatic cleanup.

```typescript
const unsubscribe = router.subscribe((match) => {
  if (match) {
    console.log('Route:', match.route.path);
    console.log('Params:', match.params);
    console.log('Data:', match.data);
  }
});

// Later: cleanup
unsubscribe();
```

### `router.getCurrentMatch(): RouteMatch | null`

Get current route match synchronously.

### `router.prefetch(path: string): Promise<void>`

Preload a route's component for instant navigation.

### `router.getBreadcrumbs(): Array<{ path: string; title: string }>`

Generate breadcrumbs for current route from meta.title.

### `router.clearCache(): void`

Clear the route matching cache (useful after dynamic route changes).

### `router.destroy(): void`

Clean up router and remove all event listeners. **Important** for preventing memory leaks.

## Route Configuration

### LoaderContext

Context passed to route loaders with full URL information:

```typescript
interface LoaderContext<Path extends string> {
  params: ExtractParams<Path>;     // Type-safe path parameters
  query: URLSearchParams;           // Query parameters (always fresh)
  hash: string;                     // URL hash (always fresh)
  signal: AbortSignal;              // For cancellation
  context?: unknown;                // Optional guard context (requires type assertion)
}
```

### GuardResult

Enhanced guard return types for flexible navigation control:

```typescript
type GuardResult<TContext = unknown> =
  | { allow: true; context?: TContext }            // Allow with optional context
  | { redirect: string; replace?: boolean }        // Redirect
  | { deny: true; reason?: string }                // Deny with reason
  | boolean;                                        // Simple allow/deny (backward compatible)
```

**Examples:**
```typescript
guard: async (params) => {
  const user = await getUser();
  
  if (!user) return { redirect: '/login', replace: true };
  if (!user.isPremium) return { deny: true, reason: 'Premium required' };
  return { allow: true, context: { user } };
}
```

### CacheStrategy

Cache strategies for route matching optimization:

```typescript
type CacheStrategy = 'params' | 'query' | 'full' | false;
```

- `'params'`: Cache by path + params only (default, ignores query/hash)
- `'query'`: Cache by path + params + query (ignores hash)
- `'full'`: Cache by everything (path + params + query + hash)
- `false`: No caching, always re-match and re-load

## Utilities

All utilities are imported from `@overhead/router/utils`:

```typescript
import { buildUrl, buildPath, buildQuery } from '@overhead/router/utils';
```

### `buildPath<Path>(path: Path, params: ExtractParams<Path>): string`

Build URL from path template with type-safe parameters.

### `buildUrl<Path>(path: Path, params: ExtractParams<Path>, query?: Record<string, string>): string`

Build complete URL with path params and query params.

### `buildQuery(params: Record<string, string | number | boolean | undefined>): string`

Build query string from object (omits undefined values).

### `createPrefetchHandler(router): (e: MouseEvent) => void`

Create mouseover handler for link prefetching.

### `pathMatches(currentPath: string, pattern: string, exact?: boolean): boolean`

Check if path matches pattern (prefix or exact).

### `getActiveClass(currentPath: string, linkPath: string, activeClass?: string, exact?: boolean): string`

Get CSS class for active links (default: 'active').

### `createRouteBuilder<TRoutes>(routes: TRoutes, router?: Router)`

Create type-safe route builder with autocomplete.

### Other Utilities

- `preloadRoute(route: Route): Promise<void>` - Preload single route
- `preloadRoutes(routes: Route[]): Promise<void>` - Preload multiple routes
- `validatePath<TRoutes>(routes: TRoutes, path: string)` - Type guard for path validation
- `ScrollRestoration` - Class for managing scroll positions
- `PerformanceMonitor` - Class for navigation performance tracking
- `debounce<T>(fn: T, delay: number)` - Debounce helper

## Type Definitions

### RouteMatch

Result of matching URL to route:

```typescript
interface RouteMatch<Path extends string, TData = unknown> {
  route: Route<Path>;
  params: ExtractParams<Path>;
  query: URLSearchParams;           // Always fresh
  hash: string;                      // Always fresh
  path: string;
  data?: TData;                      // From loader
}
```

### NavigationError

Discriminated union for type-safe error handling:

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

### Type Inference Utilities

```typescript
type InferRouteData<R extends Route> = ...     // Extract loader data type
type InferRouteParams<R extends Route> = ...   // Extract params type
type InferRouteComponent<R extends Route> = ... // Extract component type
```

### Route Registry

```typescript
type RouteRegistry = Record<string, Route>;
type RouteNames<R extends RouteRegistry> = keyof R;
type RouteByName<R extends RouteRegistry, K extends keyof R> = R[K];

function createRouteRegistry<T extends RouteRegistry>(routes: T): T;
function matchesRoute<R extends Route>(...): match is RouteMatch<...>;
```

### Redirect Helper

```typescript
function redirect(path: string, replace?: boolean): never;
class RedirectResponse extends Error { ... }
```

## Click Interception

Router automatically intercepts clicks on `<a>` links with these guards:

**Intercepted:**
- Internal links (`href="/products/123"`)
- Left-click only
- No modifier keys (Ctrl, Cmd, Shift, Alt)
- No `target` attribute or `target="_self"`
- Same origin
- Not marked with `data-external`

**Not intercepted:**
- External links, Ctrl+Click, right-click, middle-click
- Links with `target="_blank"` or `download` attribute
- Links marked `data-external`
- Hash-only links (handled specially for same-page navigation)

## Performance Notes

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Route matching (cached) | O(1) | LRU cache, last N routes |
| Route matching (uncached) | O(n) | Linear scan of routes |
| Navigation | O(1) + loader time | Excluding network |
| Subscribe | O(1) | Add to Set |
| Notify | O(s) | s = subscriber count |

## Browser Support

- **Core routing:** Chrome 95+, Edge 95+, Safari 16.4+, Firefox 120+
- **View Transitions:** Chrome 111+, Edge 111+, Safari 18+ (graceful fallback)
- **Navigation API:** Chrome 102+, Edge 102+ only (NOT Safari/Firefox, automatic fallback)

---

For detailed implementation notes and design decisions, see the source code TypeScript definitions in `src/router/types/`.
