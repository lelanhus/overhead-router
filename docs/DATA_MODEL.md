# Data Model

Type system and data structures for @overhead/router v1.0.0.

> **Note:** This document reflects the actual implementation in `src/router/types/*.ts`. The source TypeScript definitions are the authoritative reference.

## Core Types

### ExtractParams

Recursively extracts parameter names from path patterns at compile-time.

```typescript
type ExtractParams<Path extends string> =
  Path extends `${infer _Prefix}/:${infer Param}/${infer Suffix}`
    ? { readonly [K in Param]: string } & ExtractParams<Suffix>
    : Path extends `${infer _Prefix}/:${infer Param}`
      ? { readonly [K in Param]: string }
      : Record<string, never>;
```

**Examples:**
```typescript
ExtractParams<'/users/:id'>                          // { readonly id: string }
ExtractParams<'/users/:userId/posts/:postId'>        // { readonly userId: string; readonly postId: string }
ExtractParams<'/home'>                                // Record<string, never>
```

**Key features:**
- All parameters are `readonly` for immutability
- Zero runtime overhead (compile-time only)
- Type errors for invalid parameter access

### GuardResult

Discriminated union for flexible navigation control:

```typescript
type GuardResult<TContext = unknown> =
  | { readonly allow: true; readonly context?: TContext }
  | { readonly redirect: string; readonly replace?: boolean }
  | { readonly deny: true; readonly reason?: string }
  | boolean; // Backward compatible
```

**Design note:** Context is typed as `TContext` in guards but `unknown` in loaders. This is intentional - see `src/router/types/route.ts` JSDoc for the design rationale.

### LoaderContext

Context object passed to route loaders:

```typescript
interface LoaderContext<Path extends string = string> {
  readonly params: ExtractParams<Path>;  // Type-safe path parameters
  readonly query: URLSearchParams;        // Query parameters (always fresh)
  readonly hash: string;                  // URL hash (always fresh)
  readonly signal: AbortSignal;           // For cancellation
  readonly context?: unknown;             // Optional guard context (use type assertion)
}
```

**Important:** `query` and `hash` are **never cached** - always read fresh from `window.location`.

### CacheStrategy

Cache strategy types for route matching optimization:

```typescript
type CacheStrategy = "params" | "query" | "full" | false;
```

**Strategies:**
- `'params'`: Cache by path + params only (default, query/hash changes don't invalidate)
- `'query'`: Cache by path + params + query (hash changes don't invalidate)
- `'full'`: Cache by everything (path + params + query + hash)
- `false`: No caching, always re-match and re-load

### CacheConfig

```typescript
interface CacheConfig {
  readonly strategy: CacheStrategy;
  readonly maxAge?: number; // TTL in milliseconds (default: Infinity)
}
```

### Route

Route definition with full type safety:

```typescript
interface Route<
  Path extends string = string,
  TComponent = unknown,
  TData = unknown
> {
  readonly path: Path;
  readonly component: () => Promise<TComponent> | TComponent;
  readonly guard?: (params: ExtractParams<Path>) => GuardResult | Promise<GuardResult>;
  readonly loader?: (context: LoaderContext<Path>) => Promise<TData> | TData;
  readonly children?: ReadonlyArray<Route>;
  readonly meta?: Readonly<Record<string, unknown>>;
  readonly cache?: CacheStrategy | CacheConfig; // Per-route cache override
}
```

**All properties are readonly** for immutability and safe sharing across components.

### RouterConfig

Router initialization configuration:

```typescript
interface RouterConfig {
  readonly routes: ReadonlyArray<Route>;
  readonly base?: string;
  readonly notFound?: () => void | Promise<void>;
  readonly unauthorized?: () => void | Promise<void>;
  readonly onError?: (error: NavigationError) => void;
  readonly hooks?: {
    readonly beforeNavigate?: (path: string) => boolean | Promise<boolean>;
    readonly afterNavigate?: (path: string) => void | Promise<void>;
  };
  readonly ssr?: boolean;                  // SSR mode (default: false)
  readonly viewTransitions?: boolean;       // View Transitions API (default: true)
  readonly useNavigationAPI?: boolean;      // Navigation API (default: false)
  readonly cache?: {
    readonly strategy?: CacheStrategy;      // Default: 'params'
    readonly maxSize?: number;              // LRU size (default: 10)
    readonly maxAge?: number;               // Default TTL (default: Infinity)
  };
}
```

### RouteMatch

Result of matching a URL to a route:

```typescript
interface RouteMatch<Path extends string = string, TData = unknown> {
  readonly route: Route<Path>;
  readonly params: ExtractParams<Path>;
  readonly query: URLSearchParams;    // Always fresh from window.location.search
  readonly hash: string;              // Always fresh from window.location.hash
  readonly path: string;
  readonly data?: TData;              // From loader
}
```

**Cache behavior:** `route`, `params`, and `path` are cached based on cache strategy. `query` and `hash` are **never cached** - always read fresh from the URL.

### NavigationError

Discriminated union for type-safe error handling:

```typescript
type NavigationError =
  | { readonly type: 'not-found'; readonly path: string }
  | { readonly type: 'unauthorized'; readonly path: string; readonly route: Route }
  | { readonly type: 'guard-failed'; readonly path: string; readonly route: Route }
  | { readonly type: 'loader-error'; readonly error: Error; readonly route: Route }
  | { readonly type: 'component-error'; readonly error: Error; readonly route: Route }
  | { readonly type: 'navigation-aborted'; readonly path: string }
  | { readonly type: 'unknown'; readonly error: Error };
```

**Usage:**
```typescript
onError: (error) => {
  switch (error.type) {
    case 'not-found':
      console.log('404:', error.path);
      break;
    case 'loader-error':
      console.error('Loader failed:', error.error);
      break;
    // ... handle other cases
  }
}
```

## Type Inference Utilities

```typescript
// Extract data type from route's loader
type InferRouteData<R extends Route> = ...

// Extract params type from route's path
type InferRouteParams<R extends Route> = ...

// Extract component type from route
type InferRouteComponent<R extends Route> = ...
```

## Route Registry System

For type-safe route organization:

```typescript
type RouteRegistry = Record<string, Route>;
type RouteNames<R extends RouteRegistry> = keyof R;
type RouteByName<R extends RouteRegistry, K extends keyof R> = R[K];

function createRouteRegistry<T extends RouteRegistry>(routes: T): T;
function matchesRoute<R extends Route>(...): match is RouteMatch<...>;
```

**Example:**
```typescript
const routes = createRouteRegistry({
  home: route({ path: '/', ... }),
  products: route({ path: '/products/:id', ... })
});

// Type-safe access with autocomplete
router.navigate(routes.products.path);
```

## Redirect Helper

```typescript
function redirect(path: string, replace?: boolean): never;

class RedirectResponse extends Error {
  constructor(
    public readonly path: string,
    public readonly replace: boolean = false
  )
}
```

**Usage in loaders:**
```typescript
loader: async ({ params }) => {
  const product = await fetchProduct(params.id);
  if (!product) redirect('/404'); // Throws RedirectResponse
  return product;
}
```

## Internal Types

### CompiledRoute

Pre-compiled route for performance (internal use):

```typescript
interface CompiledRoute<Path extends string = string> {
  readonly route: Route<Path>;
  readonly pattern: URLPattern | RegExp;
  readonly paramNames: readonly string[];
}
```

### NavigateOptions

Options for programmatic navigation:

```typescript
interface NavigateOptions {
  readonly replace?: boolean;  // Replace history entry (default: false)
  readonly scroll?: boolean;   // Scroll to top (default: true)
  readonly state?: unknown;    // Custom history state
}
```

### RouterState

Internal router state tracking (for future use):

```typescript
type RouterState =
  | { readonly status: "idle" }
  | { readonly status: "navigating"; readonly path: string }
  | { readonly status: "matched"; readonly match: RouteMatch }
  | { readonly status: "error"; readonly error: NavigationError };
```

## Cache Behavior

### What Gets Cached (Based on Strategy)

**'params' strategy (default):**
- ✓ Cached: route, params, path
- ✗ Never cached: query, hash, loader data

**'query' strategy:**
- ✓ Cached: route, params, path, query
- ✗ Never cached: hash, loader data

**'full' strategy:**
- ✓ Cached: route, params, path, query, hash
- ✗ Never cached: loader data

**false (no caching):**
- ✗ Nothing cached, always re-match and re-load

### Why Query/Hash Aren't Cached in 'params' Mode

Query and hash change frequently without route changes (e.g., `/products?sort=price` → `/products?sort=name`). The `'params'` strategy (default) ignores these changes for cache keys, but query/hash are always read fresh from `window.location` so RouteMatch always has current values.

The cache strategy only affects when to re-run loaders, not when to read query/hash.

## Type Safety Guarantees

### Compile-Time Validation

```typescript
// ✓ Valid - params match path pattern
buildPath('/users/:id', { id: '123' });

// ✗ TypeScript error - missing param
buildPath('/users/:id', {});

// ✗ TypeScript error - wrong param name
buildPath('/users/:id', { userId: '123' });
```

### Runtime Type Guards

None - all type safety is compile-time only. Use TypeScript strict mode for maximum safety.

## Immutability

All data structures use `readonly` modifiers to prevent accidental mutation:

```typescript
interface Route {
  readonly path: string;                         // Cannot reassign
  readonly children?: ReadonlyArray<Route>;      // Cannot mutate array
  readonly meta?: Readonly<Record<string, unknown>>; // Cannot mutate object
}
```

This enables safe sharing of route definitions across components without defensive copying.

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Route matching (cached) | O(1) | LRU cache hit |
| Route matching (uncached) | O(n) | Linear scan of routes |
| URL parameter extraction | O(1) | Regex groups or URLPattern |
| Query parsing | O(m) | m = number of query params |
| Subscriber notification | O(s) | s = number of subscribers |
| Navigation abort | O(1) | AbortController |

## Memory Management

### LRU Cache

- Default size: 10 routes
- Evicts oldest entries when full
- Configurable via `cache.maxSize` in RouterConfig

### TTL (Time-To-Live)

- Default: `Infinity` (never expires)
- Configurable per-route or globally
- Checked on cache lookup

### Cleanup

```typescript
// Cleanup router
router.destroy();
// Removes all listeners, clears subscribers, aborts navigations

// Cleanup subscription
const unsub = router.subscribe(listener);
unsub(); // Remove listener
```

---

For implementation details and design decisions, see the source TypeScript definitions in `src/router/types/`.
