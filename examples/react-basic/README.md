# React Basic Example - sane-router

This example demonstrates how to integrate sane-router with React using a custom `useRouter` hook.

## Features

- Custom `useRouter` hook for reactive route updates
- Data loading with async loaders
- TypeScript support
- Route parameters and query strings
- Navigation with Link component pattern
- Loading states and error handling

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

- `src/router.ts` - Router instance and route definitions
- `src/hooks/useRouter.ts` - Custom React hook for router integration
- `src/App.tsx` - Main application component
- `src/main.tsx` - React entry point

## How It Works

### Router Setup

The router is created using `createRouter` from sane-router with route definitions:

```typescript
import { createRouter, route } from 'sane-router';

const router = createRouter([
  route('/', {
    loader: async () => ({ message: 'Welcome!' })
  }),
  route('/users/:id', {
    loader: async ({ params, signal }) => {
      const res = await fetch(`/api/users/${params.id}`, { signal });
      return res.json();
    }
  })
]);
```

### React Integration

The `useRouter` hook subscribes to router changes and triggers re-renders:

```typescript
function useRouter() {
  const [match, setMatch] = useState(router.getCurrentMatch());

  useEffect(() => {
    return router.subscribe(setMatch);
  }, []);

  return match;
}
```

### Using in Components

```typescript
function App() {
  const match = useRouter();

  if (match?.loading) {
    return <div>Loading...</div>;
  }

  return <div>{match?.data?.message}</div>;
}
```

## API Reference

### LoaderContext

Loaders receive a context object with:

- `params` - Route parameters (e.g., `{ id: '123' }`)
- `query` - Query string parameters (e.g., `{ search: 'term' }`)
- `hash` - URL hash fragment
- `signal` - AbortSignal for request cancellation

### Match Object

The match object returned by `useRouter()` contains:

- `route` - The matched route definition
- `params` - Parsed route parameters
- `data` - Data returned from the loader
- `loading` - Boolean indicating loading state
- `error` - Error object if loader failed

## License

MIT
