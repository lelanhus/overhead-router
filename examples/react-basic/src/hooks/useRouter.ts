import { useState, useEffect } from 'react';
import { router } from '../router';
import type { RouteMatch } from '@overhead/router';

/**
 * Custom hook for integrating @overhead/router with React.
 *
 * Subscribes to router changes and triggers component re-renders
 * when the current route match changes.
 *
 * @returns The current route match object or null if no route is matched
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const match = useRouter();
 *
 *   if (match?.loading) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (match?.error) {
 *     return <div>Error: {match.error.message}</div>;
 *   }
 *
 *   return <div>{match?.data?.title}</div>;
 * }
 * ```
 */
export function useRouter(): RouteMatch | null {
  const [match, setMatch] = useState<RouteMatch | null>(router.getCurrentMatch());

  useEffect(() => {
    // Subscribe to router changes
    const unsubscribe = router.subscribe(setMatch);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return match;
}
