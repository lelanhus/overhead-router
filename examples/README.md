# Examples

This directory contains examples demonstrating sane-router usage patterns, from basic getting-started guides to comprehensive feature showcases.

## 🚀 Runnable Applications

### Quick Start: Vanilla TypeScript
**Location:** `vanilla-basic/`

The easiest way to get started with sane-router. A minimal vanilla TypeScript application demonstrating core routing features.

**Features:**
- Dynamic routes with parameters
- Data loading with loaders
- Semantic HTML links
- Client-side navigation

**Running:**
```bash
cd vanilla-basic
npm install
npm run dev
```

Open http://localhost:5173

---

### React Integration
**Location:** `react-basic/`

Shows how to integrate sane-router with React applications using custom hooks.

**Features:**
- Custom `useRouter()` hook
- React component patterns
- Data loading with loading states
- Type-safe routing with TypeScript

**Running:**
```bash
cd react-basic
npm install
npm run dev
```

Open http://localhost:5173

---

### Kitchen Sink (Comprehensive Demo)
**Location:** `kitchen-sink/`

**The complete reference example** showcasing ALL sane-router v1.0.0 features in one application.

**Demonstrates:**
- ✅ LoaderContext (params, query, hash, signal)
- ✅ Route guards and authorization
- ✅ Nested routes (3 levels deep)
- ✅ Data loading with loaders
- ✅ Hash navigation
- ✅ Query parameters
- ✅ Programmatic navigation
- ✅ Prefetching
- ✅ Breadcrumbs
- ✅ Lifecycle hooks (beforeNavigate, afterNavigate)
- ✅ Error handlers (notFound, unauthorized, onError)
- ✅ Metadata and document titles
- ✅ Subscribe pattern
- ✅ All navigation features

**Running:**
```bash
cd kitchen-sink
npm install
npm run dev
```

Open http://localhost:5174

**What to try:**
- Click around to see instant navigation
- Try the protected Admin section (requires "login")
- Use the Search page with query parameters
- View the Tabs page for hash navigation
- Hover over links to see prefetching
- Check breadcrumbs in nested routes
- Open dev console to see lifecycle hooks

---

### Standalone HTML Demo
**Location:** `index.html`

A self-contained HTML file that works without any build tools. Perfect for quick experimentation or understanding the basics.

**Running:**
Simply open `index.html` in your web browser. No build step required!

**Features:**
- No build tools needed
- Semantic HTML navigation
- Shows router fundamentals
- Great for learning the basics

---

## 📝 Code Snippets

These TypeScript files show specific patterns and can be used as reference when building your own application.

### Basic Usage
**File:** `basic-usage.ts`

Comprehensive example showing:
- Declarative route definitions
- Route guards for authorization
- Data loaders with LoaderContext
- Nested routes
- Navigation hooks
- Semantic HTML links

### Performance Optimized
**File:** `performance-optimized.ts`

Advanced patterns for performance:
- Route prefetching strategies
- Scroll restoration
- Performance monitoring
- Memory management
- Optimized data loading

### Type Safety Demo
**File:** `type-safety-demo.ts`

TypeScript type safety features:
- Type-safe path parameters
- Compile-time parameter validation
- Type inference examples
- Common type errors (and how to fix them)

---

## 📚 Learning Path

### Beginner
1. Start with **Standalone HTML Demo** (`index.html`)
2. Review **Basic Usage** code snippet (`basic-usage.ts`)
3. Try **Vanilla Basic** runnable app (`vanilla-basic/`)

### Intermediate
4. Explore **React Integration** (`react-basic/`)
5. Review **Performance Optimized** patterns (`performance-optimized.ts`)

### Advanced
6. Study **Kitchen Sink** comprehensive demo (`kitchen-sink/`)
7. Review **Type Safety Demo** (`type-safety-demo.ts`)
8. Read the architecture docs in parent directory

---

## 🎯 Examples by Feature

### Navigation
- **Semantic HTML:** `index.html`, `vanilla-basic/`
- **Programmatic:** `kitchen-sink/`
- **Hash navigation:** `kitchen-sink/` (Tabs page)
- **Query params:** `kitchen-sink/` (Search page)

### Data Loading
- **Basic loaders:** `vanilla-basic/`, `basic-usage.ts`
- **LoaderContext:** All examples (v1.0.0 API)
- **AbortSignal:** `kitchen-sink/`, `performance-optimized.ts`

### Route Protection
- **Guards:** `basic-usage.ts`, `kitchen-sink/` (Admin section)
- **Authorization:** `kitchen-sink/`

### Advanced Patterns
- **Nested routes:** `basic-usage.ts`, `kitchen-sink/`
- **Prefetching:** `performance-optimized.ts`, `kitchen-sink/`
- **Breadcrumbs:** `kitchen-sink/`
- **Lifecycle hooks:** `kitchen-sink/`, `basic-usage.ts`

### Framework Integration
- **React:** `react-basic/`
- **Vanilla:** `vanilla-basic/`, `index.html`

---

## 🔗 Quick Links

- [Main Documentation](../README.md) - Getting started and overview
- [API Reference](../API.md) - Complete API documentation
- [Data Model](../DATA_MODEL.md) - Type system and data structures
- [Design Philosophy](../DESIGN.md) - Why sane-router is built this way
- [Performance](../PERFORMANCE.md) - Benchmarks and optimizations

---

## 💡 Tips

1. **Start simple:** Begin with `vanilla-basic/` or `index.html`
2. **Use TypeScript:** Type safety catches errors at compile time
3. **Follow patterns:** The examples show best practices
4. **Check kitchen-sink:** When in doubt, see how kitchen-sink does it
5. **Read comments:** Examples include inline explanations

---

## 🤝 Contributing Examples

Have a great example to share? We welcome contributions!

- **Framework integrations:** Vue, Svelte, Solid
- **Real-world patterns:** Auth flows, multi-step forms
- **Integration examples:** TanStack Query, tRPC, etc.
- **Advanced use cases:** SSR, code splitting, etc.

Contributions welcome! Please open an issue or pull request on GitHub.
