# Router by Example

An interactive tutorial for learning **@overhead/router** from zero to hero.

## Overview

This tutorial application is **self-referential**: it uses @overhead/router for its own navigation to demonstrate the router in real-world use. Each example builds progressively on the previous one, taking you from basic routing to advanced patterns.

## Running Locally

### Prerequisites
- A local HTTP server (browsers block ES modules from `file://` URLs)
- Modern browser (Chrome 95+, Safari 16.4+, Firefox 120+)

### Quick Start

**Option 1: Using Python**
```bash
cd examples
python3 -m http.server 8000
```

**Option 2: Using Node.js (http-server)**
```bash
npm install -g http-server
cd examples
http-server -p 8000
```

**Option 3: Using Bun**
```bash
cd examples
bun --hot index.html
```

Then visit: **http://localhost:8000**

## Tutorial Structure

The tutorial contains **20 comprehensive examples** organized by difficulty level:

### Beginner (Examples 1-5)
Learn the fundamentals of declarative routing:
- **01. Hello Router** - Minimal setup with a single route
- **02. Multiple Routes** - Building a multi-page application
- **03. Link Navigation** - Semantic `<a>` tags with automatic interception
- **04. Route Parameters** - Type-safe `:userId` patterns
- **05. Using Parameters** - Accessing params in components

### Intermediate (Examples 6-10)
Master data loading and state management:
- **06. Query Strings** - Reading `?search=foo&filter=bar`
- **07. Hash Navigation** - URL fragments and scroll behavior
- **08. Data Loaders** - Async data fetching with loaders
- **09. Abort Signals** - Cancelling requests on navigation
- **10. Route Guards (Basic)** - Boolean allow/deny

### Advanced (Examples 11-15)
Explore power features and patterns:
- **11. Enhanced Guards** - Redirect, deny with reason, context passing
- **12. Nested Routes** - Parent layouts with child routes
- **13. Cache Strategies** - Per-route caching (params, query, full)
- **14. Programmatic Redirects** - `redirect()` from loaders
- **15. Route Subscriptions** - Reacting to route changes

### Expert (Examples 16-20)
Achieve mastery with advanced techniques:
- **16. Breadcrumbs** - Automatic breadcrumb generation
- **17. Route Prefetching** - Instant navigation with `prefetch()`
- **18. Active Link Styling** - `getActiveClass()` utility
- **19. Error Handling** - NavigationError types, recovery patterns
- **20. Full App Pattern** - Auth guards + nested layouts + data loading

## Design Philosophy

This tutorial follows these principles:

### Clean & Monochromatic
- No colored icons or gradients
- Black, white, and grays only
- Typography-first design
- Crisp borders and clean spacing

### Progressive Learning
- Each example introduces ONE new concept
- Examples build on previous knowledge
- Clear explanations with annotated code
- Live interactive demos for every concept

### Self-Referential
- The tutorial itself uses @overhead/router
- Navigate between examples using the router
- Real-world demonstration of routing patterns
- Eating our own dog food!

## File Structure

```
examples/
├── index.html              # Main tutorial shell
├── styles.css              # Clean monochromatic styles
├── tutorial.js             # Router setup & orchestration
├── README.md               # This file
├── examples/               # Example modules (1-20)
│   ├── 01-hello-router.js
│   ├── 02-multiple-routes.js
│   └── ... (18 more)
└── components/             # Shared components
    ├── code-block.js       # Syntax-highlighted code display
    └── demo-frame.js       # Live demo container
```

## Creating New Examples

Each example module exports two functions:

```javascript
/**
 * Render function - returns HTML string
 * @param {RouteMatch} match - Current route match from router
 * @returns {Promise<string>} HTML content
 */
export async function render(match) {
  return `
    <div class="example-content">
      <h1 class="example-title">Example Title</h1>
      <p class="example-description">Description here...</p>
      <!-- Content here -->
    </div>
  `;
}

/**
 * Setup function - runs after render, adds interactivity
 * @param {HTMLElement} container - The content container
 */
export function setup(container) {
  // Add event listeners, initialize demos, etc.
}
```

### Helper Components

Use the provided components for consistency:

```javascript
import { createCodeBlock, createAnnotatedCode } from '../components/code-block.js';
import { createDemoFrame, createLogger } from '../components/demo-frame.js';

// Syntax-highlighted code block
const codeHtml = createCodeBlock(code, 'filename.js', 'javascript');

// Interactive demo with reset button
const { html, demoId } = createDemoFrame('Demo Title', (container, output) => {
  const logger = createLogger(output);
  logger.log('Demo initialized');
  // Setup demo logic here
});
```

## Contributing Examples

We welcome contributions! To add or improve examples:

1. Fork the repository
2. Create your example in `examples/examples/`
3. Follow the existing pattern (render + setup functions)
4. Test locally to ensure it works
5. Submit a pull request

**Guidelines:**
- Keep examples focused on ONE concept
- Provide clear explanations with code annotations
- Include a live interactive demo
- Use the helper components for consistency
- Follow the monochromatic design (no colors!)

## Technical Details

### Router Configuration

The tutorial router uses these settings:

```javascript
createRouter({
  routes: [...], // All 20 examples as routes
  notFound: () => { /* Custom 404 handler */ }
});
```

### Import Paths

Examples import from the built dist:

```javascript
import { createRouter, route } from '../../dist/index.js';
```

### ES Modules

All code uses ES modules (`import`/`export`). No build step required—modern browsers support this natively over HTTP.

## Browser Compatibility

- **Required:** ES modules, URLPattern (with RegExp fallback), History API
- **Optional:** View Transitions API (Chrome 111+, Safari 18+)
- **Tested:** Chrome 120+, Safari 17+, Firefox 120+

## License

MIT License - Part of the @overhead/router project.

## Links

- **Repository:** https://github.com/lelandhusband/overhead-router
- **Documentation:** See `/docs` folder in repo
- **NPM Package:** `npm install @overhead/router`

---

**Happy Learning!** Start with Example 01 and work your way through. By Example 20, you'll be a routing expert.
