/**
 * Type Safety Demonstration
 * This file shows how sane-router catches errors at compile time
 * Run: bun run typecheck
 */

import { createRouter, route } from '../src/router';
import { buildUrl } from '../src/utils';

// ✅ VALID: Type-safe route definition
const validRouter = createRouter({
  routes: [
    route('/products/:id', {
      component: () => import('./pages/product'),
      loader: async ({ params, signal }) => {
        // ✅ params.id is typed as string
        const id: string = params.id;
        console.log('Product ID:', id);
        return { id };
      },
    }),

    route('/users/:userId/posts/:postId', {
      component: () => import('./pages/post'),
      loader: async ({ params, signal }) => {
        // ✅ Both parameters are correctly typed
        const userId: string = params.userId;
        const postId: string = params.postId;
        return { userId, postId };
      },
    }),
  ],
});

// ✅ VALID: Type-safe URL building
const validUrl1 = buildUrl('/products/:id', { id: '123' });
const validUrl2 = buildUrl('/users/:userId/posts/:postId', {
  userId: 'john',
  postId: '42',
});

// ❌ TYPE ERROR: Missing required parameter
// @ts-expect-error - Testing: Should fail because 'id' is missing
const invalidUrl1 = buildUrl('/products/:id', {});

// ❌ TYPE ERROR: Wrong parameter name
// @ts-expect-error - Testing: Should fail because 'productId' doesn't match ':id'
const invalidUrl2 = buildUrl('/products/:id', { productId: '123' });

// ❌ TYPE ERROR: Accessing non-existent parameter
const errorRouter = createRouter({
  routes: [
    route('/products/:id', {
      component: () => 'product',
      loader: async ({ params, signal }) => {
        // @ts-expect-error - Testing: 'invalidParam' doesn't exist
        const invalid = params.invalidParam;
        return invalid;
      },
    }),
  ],
});

/**
 * Compile this file to see TypeScript catch the errors:
 *
 * $ bun run typecheck
 *
 * Expected errors:
 * - Line ~37: Argument of type '{}' is not assignable to parameter
 * - Line ~41: Argument of type '{ productId: string }' is not assignable
 * - Line ~51: Property 'invalidParam' does not exist on type
 */

console.log('✅ Type safety demonstration compiled');
console.log('If you see this, the @ts-expect-error directives are working correctly');
