# Overhead Router

Declarative, type-safe routing library for the Overhead framework. Framework-agnostic, ~4KB gzipped.

## Tech Stack
- TypeScript 5.9+ (strict mode + NodeNext modules)
- Build: tsup (dual ESM/CJS output)
- Testing: Vitest
- Runtime: Bun (dev), Node 18+ (users)

## Bash Commands
- bun build: Build library to /dist (ESM + CJS + .d.ts)
- bun test: Run Vitest test suite
- bun run typecheck: Run TypeScript compiler checks
- bun run lint: Run ESLint
- bun run format: Run Prettier
- bun run format:check: Check Prettier formatting (CI)

## CI/CD Pipeline
GitHub Actions runs on every push to `main` and all pull requests:

### Quality Checks Job
- **Type checking** - `bun run typecheck` (catches type errors)
- **Linting** - `bun run lint` (enforces code quality rules)
- **Formatting** - `bun run format:check` (ensures consistent style)
- **Tests** - `bun test` (runs all 80 tests)
- **Build** - `bun run build` (verifies production build)
- **Bundle size check** - Warns if gzipped bundle exceeds 7KB

### Test Matrix Job
- Tests on **Node.js 18, 20, 22** to ensure compatibility
- Uses Bun for fast dependency installation
- Runs full test suite on each Node version

All CI checks must pass before merging PRs.

## Code Style
- Use ES modules (import/export), never CommonJS in source
- Named exports only (no default exports)
- TypeScript strict mode enabled
- Functional, immutable patterns preferred
- JSDoc all public APIs

## TypeScript/ESLint Strict Configuration
This codebase enforces **90-95% compile-time error detection** through strict TypeScript and ESLint rules.

### TypeScript Compiler Flags
- **Module System**: `NodeNext` with `verbatimModuleSyntax: true` (pure ESM, explicit `.js` extensions required)
- **Type Safety**: `exactOptionalPropertyTypes`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`
- **Dead Code**: `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode: false`
- **Interop**: `esModuleInterop: false` (no synthetic imports)

### ESLint Rules
- **strict-boolean-expressions**: All conditionals must use explicit null/undefined/empty checks
  - ❌ `if (str)` → ✅ `if (str !== '')`
  - ❌ `if (obj)` → ✅ `if (obj !== null)`
  - ❌ `obj?.field` → ✅ `obj?.field !== undefined`
- **prefer-readonly**: All class fields that aren't reassigned must be `readonly`
- **consistent-type-imports**: Use `import type` for type-only imports

### Immutability Patterns
**Preferred patterns:**
- **Array building**: Accumulation arrays + `join()` instead of string concatenation
- **Conditional values**: Ternary expressions or IIFE instead of `let` reassignment
- **Transformations**: `map()`, `reduce()`, `filter()` instead of `for` loops with `push()`
- **Array updates**: Spread + `slice()` instead of `push()/shift()`

**Justified exceptions (only 3 in entire codebase):**
1. `let data` in `Router.navigate()` - Complex try-catch error handling flow
2. `let timeoutId` in `debounce()` - Closure requirement for timer management
3. `metrics` array in `PerformanceMonitor` - Uses immutable reassignment pattern (`[...arr, item].slice(-100)`)

### Import Requirements
All relative imports MUST include `.js` extension due to NodeNext module resolution:
```typescript
import { Router } from './router.js';  // ✅ Required
import { Router } from './router';     // ❌ Compilation error
```

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
- ✓ All 80 tests passing
- ✓ No TypeScript errors (bun run typecheck)
- ✓ No ESLint errors (bun run lint)
- ✓ Bundle size within limits
- ✓ No circular dependencies
- ✓ Documentation updated (README, API.md, DATA_MODEL.md, CLAUDE.md)

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
- TypeScript: >= 5.9.0
- Target browsers: Modern (Chrome 95+, Safari 16.4+, Firefox 120+)
