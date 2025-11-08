# Overhead Router

Declarative, type-safe routing library for the Overhead framework. Framework-agnostic, ~4KB gzipped.

## Tech Stack
- TypeScript 5.3+ (strict mode)
- Build: tsup (dual ESM/CJS output)
- Testing: Vitest
- Runtime: Bun (dev), Node 18+ (users)

## Bash Commands
- bun build: Build library to /dist (ESM + CJS + .d.ts)
- bun test: Run Vitest test suite
- bun run typecheck: Run TypeScript compiler checks
- bun run lint: Run ESLint
- bun run format: Run Prettier

## Code Style
- Use ES modules (import/export), never CommonJS in source
- Named exports only (no default exports)
- TypeScript strict mode enabled
- Functional, immutable patterns preferred
- JSDoc all public APIs

## Architecture Principles
- **Declarative over imperative** - Routes are data structures
- **Type-safe by design** - Template literal types for param extraction
- **Zero dependencies** - No runtime deps, only dev deps
- **Framework-agnostic** - Core router has no framework coupling
- **Performance-first** - Native URLPattern API, LRU caching, O(1) lookups

## Key Design Patterns
- **LoaderContext pattern**: All loaders receive `{ params, query, hash, signal }`
- **Discriminated unions**: NavigationError uses type field for exhaustive checking
- **Template literal types**: `ExtractParams<Path>` for compile-time param validation
- **Event delegation**: Single click listener for entire app
- **Abortable operations**: All async ops use AbortController

## API Conventions
### Naming
- Route creation: `route()`, `createRouter()`
- Navigation: `navigate()`, `prefetch()`
- State access: `getCurrentMatch()`, `subscribe()`
- Utilities: `buildPath()`, `buildUrl()`, `buildQuery()`

### Type Patterns
```typescript
// Always extract params from path template
type Params = ExtractParams<'/users/:userId/posts/:postId'>
// { userId: string; postId: string }

// Loaders receive LoaderContext
loader: ({ params, query, hash, signal }) => fetch(url, { signal })
```

## Testing Requirements
- Coverage minimum: 80%
- Test all public APIs
- Test edge cases: hash navigation, guards, abort signals
- File naming: `*.test.ts`
- Run single test files during development for speed

## Performance Constraints
- Bundle size: < 5KB gzipped (currently ~4KB)
- Route matching (cached): < 0.01ms
- Route matching (uncached): < 1ms
- LRU cache: Last 10 routes, O(1) lookup

## Distribution Rules
- Dual package: ESM + CJS
- Exports order: types MUST come before import/require
- TypeScript declarations included
- Tree-shakeable exports
- Files published: dist/, src/, docs (README, API, DATA_MODEL, DESIGN, PERFORMANCE, LICENSE)

## DO NOT MODIFY Without Careful Review
- src/router.types.ts - Type inference system (ExtractParams, LoaderContext)
- Route matching algorithm - Performance-critical, well-tested
- Click handler guards - Security implications (8 comprehensive checks)
- Cache behavior - Query/hash always fresh, route/params cached

## Cache Behavior (CRITICAL)
**Cached:** route, params, path
**NEVER cached:** query, hash, data
**Reason:** Query/hash change frequently without route changes

## Quality Gates Before Release
- ✓ All 84 tests passing
- ✓ No TypeScript errors (bun run typecheck)
- ✓ Bundle size within limits
- ✓ No circular dependencies
- ✓ Documentation updated (README, API.md, DATA_MODEL.md)

## Documentation Standards
- JSDoc all public methods
- Include usage examples in comments
- Document performance characteristics (O(n) complexity)
- Explain type inference patterns
- Keep docs concise but complete

## Example Route Definition
```typescript
route('/products/:id', {
  component: () => import('./product'),
  loader: async ({ params, query, hash, signal }) => {
    const res = await fetch(`/api/products/${params.id}`, { signal });
    return res.json();
  },
  guard: (params) => checkPermission(params.id),
  meta: { title: 'Product' }
})
```

## Version Constraints
- Node.js: >= 18.0.0
- TypeScript: >= 5.3.0
- Target browsers: Modern (Chrome 95+, Safari 16.4+, Firefox 120+)
