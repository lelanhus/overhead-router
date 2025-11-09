/**
 * Navigation context builders for router
 */

import type { RouteMatch } from "../router.types.js";
import type { NormalizedConfig } from "./initialization.js";
import type { NavigationConfig, NavigationContext } from "./navigation.js";

/**
 * Build navigation configuration from router config
 *
 * @param config - Normalized router configuration
 * @returns Navigation configuration for handleNavigation
 */
export function buildNavigationConfig(
  config: NormalizedConfig,
): NavigationConfig {
  return {
    notFound: config.notFound,
    unauthorized: config.unauthorized,
    onError: config.onError,
    hooks: config.hooks,
    base: config.base,
  };
}

/**
 * Build navigation context with callbacks
 *
 * @param notifyFn - Function to notify with view transitions
 * @param restoreFn - Function to restore history
 * @returns Navigation context for handleNavigation
 */
export function buildNavigationContext(
  notifyFn: (match: RouteMatch | null) => void,
  restoreFn: () => void,
): NavigationContext {
  return {
    notifyWithTransition: notifyFn,
    restoreHistory: restoreFn,
  };
}
