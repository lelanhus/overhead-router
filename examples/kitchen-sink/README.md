# Kitchen Sink Example

Comprehensive demonstration of ALL sane-router v1.0.0 features.

## Features Demonstrated

### Router Configuration
- ✅ Complete route definitions with nested children
- ✅ Base path for subdirectory deployment
- ✅ Custom error handlers (notFound, unauthorized, onError)
- ✅ Global lifecycle hooks (beforeNavigate, afterNavigate)

### Route Features
- ✅ **LoaderContext** with all properties (params, query, hash, signal)
- ✅ **Route guards** for authorization
- ✅ **Nested routes** (3 levels deep)
- ✅ **Data loading** with async loaders
- ✅ **Meta data** for titles and breadcrumbs
- ✅ **Component lazy loading**

### Navigation Features
- ✅ Programmatic navigation with `router.navigate()`
- ✅ Navigate options (replace, scroll, state)
- ✅ Hash-only navigation
- ✅ Query parameters
- ✅ Semantic HTML `<a href>` links
- ✅ External link handling with `data-external`

### Performance Features
- ✅ Route prefetching with `router.prefetch()`
- ✅ Prefetch on hover
- ✅ AbortSignal for cancelling in-flight requests
- ✅ Parallel component and data loading

### Utility Features
- ✅ Breadcrumbs with `router.getBreadcrumbs()`
- ✅ Subscribe pattern with `router.subscribe()`
- ✅ `getCurrentMatch()` API
- ✅ Document title management from metadata

## Routes

- `/` - Home page with feature overview
- `/about#features` - About page with hash navigation demo
- `/products` - Products list with data loader
- `/products/:id` - Product detail with dynamic params
- `/search?q=...` - Search with query parameters
- `/users/:userId` - User profile with nested routes
- `/users/:userId/posts/:postId` - Nested post view
- `/users/:userId/posts/:postId/comments/:commentId` - Deep nesting (3 levels)
- `/admin` - Protected route with guard
- `/admin/dashboard` - Nested admin route
- `/admin/users` - Nested admin users
- `/tabs#tab1` - Hash navigation tabs demo

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## What to Try

1. **Click navigation links** - Notice instant navigation without page reload
2. **Use browser back/forward** - Full history support
3. **Try protected routes** - Admin section requires "authentication"
4. **Watch data loading** - Loaders fetch data in parallel with components
5. **Hover over links** - Some links prefetch on hover for instant navigation
6. **Check breadcrumbs** - Dynamic breadcrumb generation
7. **Use query params** - Search functionality with URL query strings
8. **Hash navigation** - Tabs that update hash without full navigation
9. **Open dev tools** - See AbortSignal cancelling requests
10. **Check document title** - Updates based on route metadata
