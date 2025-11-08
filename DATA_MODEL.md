# Data Model

Type system and data structures for Overhead Router.

## Core Types

### ExtractParams

Recursively extracts parameter names from path patterns.

```typescript
type ExtractParams<Path extends string> =
  Path extends `${infer _Prefix}/:${infer Param}/${infer Suffix}`
    ? { [K in Param]: string } & ExtractParams<Suffix>
    : Path extends `${infer _Prefix}/:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;
```

**Examples:**
```typescript
ExtractParams<'/users/:id'>                          // { id: string }
ExtractParams<'/users/:userId/posts/:postId'>        // { userId: string; postId: string }
ExtractParams<'/home'>                                // Record<string, never>
```

### Route

Route definition with full type safety.

```typescript
interface Route<
  Path extends string = string,
  TComponent = unknown,
  TData = unknown
> {
  readonly path: Path;
  component: () => Promise<TComponent> | TComponent;
  guard?: (params: ExtractParams<Path>) => boolean | Promise<boolean>;
  loader?: (context: LoaderContext<Path>) => Promise<TData> | TData;
  readonly children?: ReadonlyArray<Route>;
  readonly meta?: Readonly<Record<string, unknown>>;
}
```

**Fields:**
- `path` - URL pattern with `:param` syntax
- `component` - Lazy-loaded component function
- `guard` - Optional authorization check
- `loader` - Optional data loading function
- `children` - Nested routes
- `meta` - Arbitrary metadata (titles, permissions, etc.)

### LoaderContext

Context passed to route loaders.

```typescript
interface LoaderContext<Path extends string = string> {
  readonly params: ExtractParams<Path>;
  readonly query: URLSearchParams;
  readonly hash: string;
  readonly signal: AbortSignal;
}
```

**Fields:**
- `params` - Path parameters (e.g., `{ id: '123' }`)
- `query` - Query parameters as URLSearchParams
- `hash` - URL hash including `#`
- `signal` - AbortSignal for cancellation

**Usage:**
```typescript
loader: async ({ params, query, hash, signal }) => {
  const res = await fetch(`/api/users/${params.id}`, { signal });
  if (signal.aborted) return null;
  return res.json();
}
```

### RouteMatch

Result of matching a URL to a route.

```typescript
interface RouteMatch<Path extends string = string, TData = unknown> {
  readonly route: Route<Path>;
  readonly params: ExtractParams<Path>;
  readonly query: URLSearchParams;
  readonly hash: string;
  readonly path: string;
  readonly data?: TData;
}
```

**Fields:**
- `route` - Matched route definition
- `params` - Extracted path parameters
- `query` - Current query parameters (always fresh)
- `hash` - Current URL hash (always fresh)
- `path` - Matched pathname
- `data` - Data loaded from `route.loader()`

**Note:** Query and hash are **never cached** - always read fresh from `window.location`.

### RouterConfig

Configuration for router initialization.

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
  readonly ssr?: boolean;
}
```

### NavigationError

Discriminated union for type-safe error handling.

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
  }
}
```

## Internal Types

### CompiledRoute

Pre-compiled route for performance.

```typescript
interface CompiledRoute<Path extends string = string> {
  readonly route: Route<Path>;
  readonly pattern: URLPattern | RegExp;
  readonly paramNames: readonly string[];
}
```

**Fields:**
- `pattern` - URLPattern (modern) or RegExp (fallback)
- `paramNames` - Extracted parameter names for regex matching

### NavigateOptions

Options for programmatic navigation.

```typescript
interface NavigateOptions {
  readonly replace?: boolean;  // Replace history entry
  readonly scroll?: boolean;   // Scroll to top (default: true)
  readonly state?: unknown;    // Custom history state
}
```

## Data Flow

### Route Matching Flow

```
URL Input
  ↓
Strip Base Path
  ↓
Check LRU Cache (pathname only)
  ↓
If cached: return { ...cached, fresh query, fresh hash }
  ↓
If not cached: iterate compiled routes
  ↓
Match with URLPattern or RegExp
  ↓
Extract params from match groups
  ↓
Create RouteMatch with fresh query/hash
  ↓
Cache { route, params, path } (NOT query/hash)
  ↓
Return RouteMatch
```

### Navigation Flow

```
navigate(path, options)
  ↓
Abort previous navigation
  ↓
Run beforeNavigate hook
  ↓
Match route
  ↓
Run route guard
  ↓
Load data + component in parallel
  ↓
Check if aborted
  ↓
Update currentMatch
  ↓
Notify subscribers
  ↓
Run afterNavigate hook
  ↓
Update browser history
  ↓
Scroll to top (if enabled)
```

### Loader Execution

```
Route matched
  ↓
Create LoaderContext {
  params: extracted from path
  query: new URLSearchParams(location.search)
  hash: location.hash
  signal: AbortController.signal
}
  ↓
Execute loader(context) in parallel with component()
  ↓
If aborted: return early
  ↓
Attach data to RouteMatch
  ↓
Notify subscribers with enriched match
```

## Cache Behavior

### What is Cached

```typescript
{
  route: Route,     // ✓ Cached
  params: Object,   // ✓ Cached
  path: string,     // ✓ Cached
}
```

### What is NOT Cached

```typescript
{
  query: URLSearchParams,  // ✗ Always fresh from location.search
  hash: string,            // ✗ Always fresh from location.hash
  data: any,               // ✗ Re-loaded on each navigation
}
```

**Rationale:** Query and hash change frequently without affecting route matching. Caching them leads to stale data.

## Type Safety Guarantees

### Compile-Time Checks

```typescript
// ✓ Valid
buildPath('/users/:id', { id: '123' });

// ✗ TypeScript error - missing param
buildPath('/users/:id', {});

// ✗ TypeScript error - wrong param name
buildPath('/users/:id', { userId: '123' });

// ✓ Valid - no params required
buildPath('/home', {});
```

### Runtime Type Guards

None. Types are compile-time only. Use TypeScript strict mode for maximum safety.

## Memory Management

### Subscriber Cleanup

```typescript
const unsubscribe = router.subscribe(listener);

// Later
unsubscribe();  // Remove listener
```

### Router Cleanup

```typescript
router.destroy();
// Removes all event listeners
// Clears all subscribers
// Aborts in-flight navigations
```

### Cache Eviction

LRU cache automatically evicts oldest entries when size exceeds 10.

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Route matching (cached) | O(1) | LRU cache hit |
| Route matching (uncached) | O(n) | Iterate routes |
| URL parameter extraction | O(1) | Regex groups or URLPattern |
| Query parsing | O(m) | m = number of query params |
| Subscriber notification | O(s) | s = number of subscribers |
| Navigation abort | O(1) | AbortController |

## Immutability

All data structures use readonly modifiers to prevent accidental mutation:

```typescript
interface Route {
  readonly path: string;        // Cannot reassign
  readonly children?: ReadonlyArray<Route>;  // Cannot mutate array
  readonly meta?: Readonly<Record<string, unknown>>;  // Cannot mutate object
}
```

This enables safe sharing of route definitions across components without defensive copying.
