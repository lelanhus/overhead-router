# Design Philosophy

**Overhead Router** is built on the principle that **declarative APIs enable automatic performance optimizations**.

## Core Principles

### 1. Declarative Over Imperative

**Declarative (Overhead Router):**
```typescript
const router = createRouter({
  routes: [
    route('/products/:id', {
      component: () => import('./product'),
      loader: async ({ params, signal }) => fetch(`/api/products/${params.id}`, { signal }),
      guard: async (params) => checkPermission(params.id),
    })
  ]
});
```

**Imperative (traditional):**
```typescript
router.on('/products/:id', async (params) => {
  const hasPermission = await checkPermission(params.id);
  if (!hasPermission) {
    router.redirect('/unauthorized');
    return;
  }

  const data = await fetch(`/api/products/${params.id}`);
  const component = await import('./product');

  component.render(data);
});
```

**Why Declarative Wins:**

1. **Router sees the whole picture**: Knows guards, loaders, and components upfront
2. **Automatic optimizations**: Can parallelize loading, memoize results, prefetch
3. **Testable**: Routes are data structures, no side effects
4. **Type-safe**: TypeScript can infer types from configuration
5. **Readable**: Intent is clear, not buried in imperative code

### 2. Performance Through Constraints

By constraining the API to declarative patterns, we enable optimizations:

**Route Compilation:**
```typescript
// User writes this (declarative)
route('/products/:id', { component: () => import('./product') })

// Router compiles to this (optimized)
{
  pattern: URLPattern { pathname: '/products/:id' },
  paramNames: ['id'],
  component: () => import('./product')
}
```

The router knows all routes at initialization, so it can:
- Compile patterns once (not on every navigation)
- Build efficient lookup structures
- Validate routes at compile time

**Parallel Loading:**
```typescript
// User writes this (declarative)
route('/products/:id', {
  component: () => import('./product'),
  loader: async ({ params, signal }) => fetch(`/api/products/${params.id}`, { signal })
})

// Router executes this (optimized)
await Promise.all([
  import('./product'),
  fetch(`/api/products/${params.id}`, { signal })
])
```

Because loader and component are separate fields, the router can run them in parallel.

**Guard Short-Circuiting:**
```typescript
// User writes this (declarative)
route('/admin', {
  guard: async () => isAdmin(),
  loader: async ({ signal }) => fetch('/api/admin/data', { signal }),
  component: () => import('./admin')
})

// Router executes this (optimized)
if (!await guard()) {
  return; // Skip loader and component entirely
}
```

The router knows guard comes first, so it can skip expensive operations when unauthorized.

### 3. Type Safety Without Runtime Cost

Template literal types extract parameters at **compile time**:

```typescript
type ExtractParams<Path extends string> =
  Path extends `${infer Prefix}/:${infer Param}/${infer Suffix}`
    ? { [K in Param]: string } & ExtractParams<Suffix>
    : Path extends `${infer Prefix}/:${infer Param}`
    ? { [K in Param]: string }
    : {};

// This is pure TypeScript - zero runtime code!
type Params = ExtractParams<'/users/:userId/posts/:postId'>;
// { userId: string; postId: string }
```

**Zero runtime overhead** for type safety.

### 4. Semantic HTML First

The router works with standard HTML:

```html
<a href="/products/123">Product 123</a>
```

No framework-specific components required:
- ✅ Accessible by default
- ✅ Works without JavaScript (with server-side routing)
- ✅ SEO-friendly
- ✅ Progressive enhancement

The router enhances standard links, not replaces them.

### 5. Framework Agnostic Core

**Core router**: Pure TypeScript, no framework dependencies

```typescript
// Works with any rendering strategy
router.subscribe((match) => {
  // React: setState(match)
  // Vue: ref.value = match
  // Vanilla: render(match)
});
```

**Integration adapters** can be built on top:
- React: `useRouter()` hook
- Vue: `useRoute()` composable
- Svelte: `$router` store

But the core remains framework-agnostic.

## Performance Optimizations Enabled by Declarative Design

### 1. Route Compilation (O(n) → O(1))

**Without compilation:**
```typescript
function matchRoute(path: string): Route | null {
  for (const route of routes) {
    // Parse pattern every time
    const regex = new RegExp(route.path.replace(/:(\w+)/g, '([^/]+)'));
    if (regex.test(path)) return route;
  }
  return null;
}
// Called on every navigation!
```

**With compilation (declarative enables this):**
```typescript
// Compile once at initialization
this.compiledRoutes = routes.map(route => ({
  route,
  pattern: new URLPattern({ pathname: route.path }), // Pre-compiled!
  paramNames: extractParamNames(route.path)
}));

// Fast lookup
function matchRoute(path: string): Route | null {
  for (const compiled of this.compiledRoutes) {
    const match = compiled.pattern.exec({ pathname: path });
    if (match) return { route: compiled.route, params: match.pathname.groups };
  }
  return null;
}
```

**Declarative routes = compile once, match fast.**

### 2. Memoization

**Without memoization:**
```typescript
router.navigate('/products/123'); // Match: 1ms
router.navigate('/products/123'); // Match: 1ms (wasted!)
```

**With memoization (declarative enables this):**
```typescript
private currentMatch: RouteMatch | null = null;

function matchRoute(path: string): RouteMatch | null {
  if (this.currentMatch?.path === path) {
    return this.currentMatch; // 0.001ms!
  }
  // ... matching logic
  this.currentMatch = match;
  return match;
}
```

**Declarative navigation = automatic caching.**

### 3. Parallel Data Loading

**Without separation:**
```typescript
// Imperative - sequential waterfall
router.on('/products/:id', async (params) => {
  const data = await fetch(`/api/products/${params.id}`); // Wait...
  const Component = await import('./product'); // Then wait...
  Component.render(data);
});
```

**With separation (declarative):**
```typescript
// Declarative - parallel loading
route('/products/:id', {
  loader: async ({ params, signal }) => fetch(`/api/products/${params.id}`, { signal }),
  component: () => import('./product')
})

// Router executes:
const [data, Component] = await Promise.all([
  route.loader(context),
  route.component()
]);
```

**Declarative separation = automatic parallelization.**

### 4. Link Prefetching

**Without declarative routes:**
```typescript
// Can't prefetch - don't know what component to load
<a href="/products/123">Product</a>
```

**With declarative routes:**
```typescript
// Router knows the route definition!
const prefetch = createPrefetchHandler(router);

<a href="/products/123" onmouseenter={prefetch}>Product</a>

// On hover:
// 1. Match route
// 2. Preload component
// 3. Navigation is instant
```

**Declarative routes = prefetch becomes trivial.**

### 5. Single Delegated Listener

**Without declarative routing:**
```typescript
// Need to attach listener to every link
document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener('click', handleClick);
});
```

**With declarative routing:**
```typescript
// One listener for entire app
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (link && link.href.startsWith('/')) {
    e.preventDefault();
    router.navigate(link.getAttribute('href'));
  }
});
```

**Declarative routing = efficient event delegation.**

## Trade-offs

### What We Gained

✅ **Automatic optimizations** - Parallelization, memoization, prefetching
✅ **Type safety** - Compile-time route validation
✅ **Testability** - Routes are pure data
✅ **Readability** - Intent is clear
✅ **Performance** - Compiled routes, efficient matching
✅ **Small bundle** - No framework overhead (~4KB)

### What We Gave Up

❌ **Runtime flexibility** - Can't generate routes from async data
❌ **Imperative control** - Can't intercept navigation arbitrarily
❌ **Dynamic patterns** - Routes must be known at initialization

### Why The Trade-offs Are Worth It

**For 95% of apps:**
- Routes are static (known at build time)
- Declarative is more readable
- Automatic optimizations save developer time

**For the 5% that need runtime flexibility:**
- Can still generate routes programmatically
- Just need to create router with generated config

**Example - Dynamic routes:**
```typescript
// Still possible, just declarative
async function createRouterWithDynamicRoutes() {
  const apiRoutes = await fetch('/api/routes').then(r => r.json());

  const routes = apiRoutes.map(r => route(r.path, {
    component: () => import(r.component)
  }));

  return createRouter({ routes });
}
```

## Comparison with Other Routers

### React Router (26KB)

**Pros:**
- Framework integration (React-specific features)
- Mature ecosystem
- Data loading, actions, SSR

**Cons:**
- Large bundle size
- React-only
- Complex API surface

**Overhead Router difference:**
- **6.5x smaller** (4KB vs 26KB)
- Framework-agnostic
- Simpler API (declarative configuration)

### Navigo (4KB)

**Pros:**
- Small bundle
- Framework-agnostic
- Simple API

**Cons:**
- No TypeScript inference
- No data loading pattern
- Imperative route handlers

**Overhead Router difference:**
- Type-safe parameters
- Declarative loaders/guards
- Better composition (nested routes)

### TanStack Router (8KB)

**Pros:**
- Type-safe
- Data loading
- File-based or code-based

**Cons:**
- Requires CLI for file-based routing
- More complex setup
- Framework-specific adapters

**Overhead Router difference:**
- **2x smaller** (4KB vs 8KB)
- No build step required
- Simpler mental model

## Future Directions

### Potential Additions (Without Breaking Philosophy)

**1. Route Transitions**
```typescript
route('/products/:id', {
  component: () => import('./product'),
  transition: 'fade' // Declarative!
})
```

**2. Scroll Restoration**
```typescript
createRouter({
  routes: [...],
  scrollBehavior: 'auto' // Declarative!
})
```

**3. Route Meta Matching**
```typescript
route('/admin/*', {
  meta: { requiresAuth: true }
})

// Later:
if (match.route.meta?.requiresAuth) { ... }
```

**4. Lazy Route Discovery**
```typescript
createRouter({
  routes: [...],
  discover: './pages/**/*.ts' // Optional file-based
})
```

### What We Won't Add

❌ **Data mutations** - Use fetch directly
❌ **Form actions** - Use native forms
❌ **SSR framework** - Keep it client-side
❌ **React-specific hooks** - Adapters live separately

## Design Decision: Guard Context Typing

### The Trade-Off

Guards can return typed context via `GuardResult<TContext>`, but loaders receive `context` as `unknown`.
This is an intentional design decision, not an oversight.

### The Problem with Full Type Propagation

Full end-to-end type safety would require:

1. **Adding a 4th generic to Route:**
   ```typescript
   Route<Path, TComponent, TData, TContext>  // Instead of current 3
   ```

2. **Updating all type utilities:**
   ```typescript
   InferRouteData<R extends Route<string, unknown, infer TData, unknown>>
   InferRouteParams<R extends Route<infer Path, unknown, unknown, unknown>>
   // Harder to read, maintain, and understand
   ```

3. **More complex error messages:**
   - Users would see 4 generics in every error
   - Debugging becomes significantly harder
   - Learning curve increases

4. **TypeScript limitation - No automatic inference:**
   Even with full generic propagation, TypeScript **can't infer TContext from inline guards**:

   ```typescript
   // This WON'T automatically infer TContext
   route({
     guard: async () => ({ allow: true, context: { user } }),
     loader: async ({ context }) => { /* context is STILL unknown! */ }
   })

   // You'd need to manually specify ALL 4 generics:
   route<'/path', Component, Data, { user: User }>({
     guard: async () => ({ allow: true, context: { user } }),
     loader: async ({ context }) => { /* NOW it's typed */ }
   })
   ```

   So users trade **"one `as` assertion"** for **"specify 4 generics manually"**.

### Current Pattern (Pragmatic Choice)

```typescript
route({
  path: '/dashboard',
  guard: async () => {
    const user = await getUser();
    return { allow: true, context: { user } };
  },
  loader: async ({ context }) => {
    // Type assertion is safe - guard and loader defined together
    const { user } = context as { user: User };
    return fetchDashboard(user);
  }
})
```

**Pros:**
- ✅ Simple: Route has 3 generics, easy to understand
- ✅ Clear error messages
- ✅ One-line assertion when needed
- ✅ Works: Runtime behavior is perfect
- ✅ Safe: Guard/loader are co-located, assertion is valid

**Cons:**
- ❌ Requires manual type assertion for guard context

### Why This Is The Right Trade-Off

1. **Simplicity wins:** A router with 3 generics is dramatically easier to use and understand than one with 4
2. **Practicality over purity:** One `as` assertion is acceptable for co-located code
3. **TypeScript limitations:** Full typing wouldn't work automatically anyway
4. **Performance:** No runtime impact either way (purely types)
5. **Maintenance:** Simpler types = easier for contributors

### Future Enhancement

If users **specifically request** full end-to-end type propagation, it can be added in a future version as an opt-in feature. The current design doesn't prevent this - it would be backwards-compatible by defaulting `TContext` to `unknown`.

However, based on pragmatic cost-benefit analysis, we predict this won't be necessary. Users who value simplicity will prefer the current pattern.

## Conclusion

**Declarative routing isn't just about developer experience—it's an enabler for automatic performance optimizations that would be difficult or impossible with imperative APIs.**

By constraining the API to declarative patterns, we:
1. Enable compile-time optimizations (route compilation, type checking)
2. Enable runtime optimizations (parallelization, memoization, prefetching)
3. Improve testability (routes are data, not effects)
4. Maintain small bundle size (no framework overhead)
5. Preserve semantic HTML (progressive enhancement)

The result is a router that's both **easier to use** and **faster to run**.

That's **Overhead Router** - minimal overhead, maximum performance.
