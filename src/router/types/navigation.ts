/**
 * Navigation-related types and interfaces
 */

import type { Route } from "./route.js";
import type { ExtractParams } from "./type-utils.js";

/**
 * Route match result
 */
export interface RouteMatch<Path extends string = string, TData = unknown> {
  readonly route: Route<Path>;
  readonly params: ExtractParams<Path>;
  readonly query: URLSearchParams;
  readonly hash: string; // URL hash (including #)
  readonly path: string;
  readonly data?: TData; // Data loaded from route.loader()
}

/**
 * Navigation options
 */
export interface NavigateOptions {
  /** Replace current history entry instead of pushing */
  readonly replace?: boolean;

  /** Scroll to top after navigation */
  readonly scroll?: boolean;

  /** Custom state to store in history */
  readonly state?: unknown;
}

/**
 * Compiled route for performance
 * @internal
 */
export interface CompiledRoute<Path extends string = string> {
  readonly route: Route<Path>;
  readonly pattern: URLPattern | RegExp;
  readonly paramNames: readonly string[];
}

/**
 * Router state - discriminated union for type-safe state management
 *
 * Uses the discriminated union pattern with a 'status' field to enable
 * exhaustive pattern matching and type narrowing.
 *
 * @example
 * function handleState(state: RouterState) {
 *   switch (state.status) {
 *     case 'matched':
 *       // TypeScript knows state.match exists here
 *       return state.match.route;
 *     case 'error':
 *       // TypeScript knows state.error exists here
 *       return state.error;
 *     // ... handle other cases
 *   }
 *   // TypeScript will error if you miss a case (exhaustive checking)
 * }
 */
export type RouterState =
  | { readonly status: "idle" }
  | { readonly status: "navigating"; readonly path: string }
  | { readonly status: "matched"; readonly match: RouteMatch }
  | { readonly status: "error"; readonly error: NavigationError };

/**
 * Navigation errors - discriminated union for type-safe error handling
 *
 * CRITICAL: This discriminated union pattern enforces exhaustive error handling.
 * The 'type' field enables TypeScript to narrow types in switch statements.
 *
 * Benefits:
 * - Compile-time guarantee all error cases are handled
 * - Type narrowing gives access to case-specific fields
 * - Adding new error types causes compile errors in incomplete handlers
 * - Self-documenting - all error cases visible in one place
 *
 * Common pitfalls:
 * - Don't add a generic 'catch-all' case - breaks exhaustive checking
 * - Don't use if/else chains - use switch for better type inference
 * - Each type must be unique - duplicates break discriminated unions
 *
 * @example
 * function handleError(error: NavigationError) {
 *   switch (error.type) {
 *     case 'not-found':
 *       // error.path is string
 *       return show404(error.path);
 *     case 'loader-error':
 *       // error.error is Error, error.route is Route
 *       return showError(error.error, error.route);
 *     // ... TypeScript enforces handling all 7 cases
 *   }
 * }
 */
export type NavigationError =
  | { readonly type: "not-found"; readonly path: string }
  | {
      readonly type: "unauthorized";
      readonly path: string;
      readonly route: Route;
    }
  | {
      readonly type: "guard-failed";
      readonly path: string;
      readonly route: Route;
    }
  | {
      readonly type: "loader-error";
      readonly error: Error;
      readonly route: Route;
    }
  | {
      readonly type: "component-error";
      readonly error: Error;
      readonly route: Route;
    }
  | { readonly type: "navigation-aborted"; readonly path: string }
  | { readonly type: "unknown"; readonly error: Error };
