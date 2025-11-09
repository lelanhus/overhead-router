/**
 * sane-router: Declarative, type-safe routing with performance first
 */

/* eslint-disable max-lines -- Router class exceeds limit due to comprehensive JSDoc */

// Import from router modules
import { generateBreadcrumbs } from "./router/breadcrumbs.js";
import { LRUCache } from "./router/cache.js";
import { compileRoutes } from "./router/compilation.js";
import { HAS_NAVIGATION_API } from "./router/constants.js";
import {
  setupEventListeners,
  removeEventListeners,
  handleHashChange,
  type EventHandlers,
  type RouterMethods,
} from "./router/event-listeners.js";
import {
  normalizeConfig,
  createBasePathRegex,
  type NormalizedConfig,
} from "./router/initialization.js";
import { matchRoute, type CachedRouteMatch } from "./router/matching.js";
import {
  buildNavigationConfig,
  buildNavigationContext,
} from "./router/navigation-context.js";
import { handleNavigation as handleNavigationFlow } from "./router/navigation.js";
import {
  getCurrentPath as getPath,
  restoreHistory as restorePreviousHistory,
} from "./router/path-utilities.js";
import {
  navigate as performNavigation,
  notifyListeners,
  notifyWithTransition as notifyWithViewTransition,
} from "./router/router-navigation.js";
import { matchPath, prefetchRoute } from "./router/router-utilities.js";
import { RedirectResponse } from "./router.types.js";
import type {
  RouterConfig,
  RouteMatch,
  NavigateOptions,
  CompiledRoute,
} from "./router.types.js";

/**
 * Router class - manages routing state and navigation
 */
export class Router {
  private readonly config: NormalizedConfig;
  // State container that must be reassigned during route compilation
  // ESLint can't distinguish reassignment from mutation - we create new containers, never mutate
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private compiledRoutes: { readonly value: readonly CompiledRoute[] } = {
    value: [],
  };
  private readonly staticRoutes = new Map<string, CompiledRoute>();
  // State container for current route match - reassigned during navigation to create new immutable objects
  // eslint-disable-next-line functional/prefer-readonly-type
  private currentMatch: { readonly value: RouteMatch | null } = { value: null };
  private readonly routeCache: LRUCache<string, CachedRouteMatch>;
  private readonly listeners = new Set<(match: RouteMatch | null) => void>();
  // State container for event handlers - reassigned during setup to create new immutable objects
  // eslint-disable-next-line functional/prefer-readonly-type
  private eventHandlers: { readonly value: EventHandlers } = {
    value: {
      clickHandler: null,
      popstateHandler: null,
      hashchangeHandler: null,
    },
  };
  // State container for abort controller - reassigned during navigation to create new immutable objects
  // eslint-disable-next-line functional/prefer-readonly-type
  private currentNavigation: { readonly value: AbortController | null } = {
    value: null,
  };
  private readonly basePathRegex: RegExp | null = null;
  private readonly usingNavigationAPI: boolean = false;

  constructor(config: RouterConfig) {
    this.config = normalizeConfig(config);
    this.usingNavigationAPI =
      this.config.useNavigationAPI && HAS_NAVIGATION_API;
    this.routeCache = new LRUCache<string, CachedRouteMatch>(
      this.config.cache.maxSize,
    );
    this.basePathRegex = createBasePathRegex(this.config.base);
    this.compiledRoutes = compileRoutes(
      this.config.routes,
      this.staticRoutes,
      this.compiledRoutes,
    );

    if (!this.config.ssr && typeof window !== "undefined") {
      this.setupListeners();
      void this.handleNavigation(this.getCurrentPath());
    }
  }

  /**
   * Get current path (with base removed)
   * Performance: Uses cached regex (10-20x faster than creating new RegExp each call)
   */
  private getCurrentPath(): string {
    return getPath(this.basePathRegex);
  }

  /**
   * Match route using imported matching logic
   * Private wrapper for tests compatibility
   */
  private matchRoute(path: string): RouteMatch | null {
    const match = matchRoute(path, {
      staticRoutes: this.staticRoutes,
      compiledRoutes: this.compiledRoutes.value,
      routeCache: this.routeCache,
      globalStrategy: this.config.cache.strategy,
      globalMaxAge: this.config.cache.maxAge,
    });

    // Store current match (for getCurrentMatch() API)
    // This allows synchronous access to the match even before async navigation completes
    this.currentMatch = { value: match };

    return match;
  }

  /**
   * Set up browser event listeners
   */
  private setupListeners(): void {
    const methods: RouterMethods = {
      getCurrentPath: () => this.getCurrentPath(),
      handleNavigation: (path: string) => this.handleNavigation(path),
      handleHashChange: () => this.handleHashChangeInternal(),
      navigate: (path: string) => this.navigate(path),
      basePathRegex: this.basePathRegex,
      base: this.config.base,
    };

    this.eventHandlers = { value: setupEventListeners(methods) };
  }

  /**
   * Handle hash-only changes (no full navigation)
   */
  private handleHashChangeInternal(): void {
    this.currentMatch = {
      value: handleHashChange(this.currentMatch.value, (match) =>
        notifyWithViewTransition(this.config.viewTransitions, () =>
          notifyListeners(match, this.listeners, this.config.onError),
        ),
      ),
    };
  }

  /**
   * Handle navigation to a path with abort support
   */
  private async handleNavigation(path: string): Promise<void> {
    // Cancel any in-flight navigation to prevent race conditions
    this.currentNavigation.value?.abort();

    // Create new abort controller for this navigation
    const controller = new AbortController();
    this.currentNavigation = { value: controller };

    // Match route and build navigation configuration
    const match = this.matchRoute(path);
    const navConfig = buildNavigationConfig(this.config);
    const navContext = buildNavigationContext(
      (m) =>
        notifyWithViewTransition(this.config.viewTransitions, () =>
          notifyListeners(m, this.listeners, this.config.onError),
        ),
      () => this.restoreHistory(),
    );

    try {
      const enrichedMatch = await handleNavigationFlow(path, match, {
        controller,
        config: navConfig,
        context: navContext,
      });

      if (enrichedMatch !== null) {
        this.currentMatch = { value: enrichedMatch };
      }
    } catch (error) {
      // Handle redirect responses from loaders
      if (error instanceof RedirectResponse) {
        return this.navigate(error.path, { replace: error.replace });
      }
      // Other errors already handled by handleNavigationFlow
    }
  }

  /**
   * Restore previous history state when route not found
   */
  private restoreHistory(): void {
    if (this.currentMatch.value !== null) {
      restorePreviousHistory(this.currentMatch.value.path, this.config.base);
    }
  }

  /**
   * Navigate to a path
   * Public API - declarative navigation
   */
  public async navigate(
    path: string,
    options: NavigateOptions = {},
  ): Promise<void> {
    return performNavigation(path, options, {
      basePath: this.config.base,
      usingNavigationAPI: this.usingNavigationAPI,
      handleNavigationFn: (p) => this.handleNavigation(p),
    });
  }

  /**
   * Subscribe to route changes
   */
  public subscribe(listener: (match: RouteMatch | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentMatch.value);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current route match
   */
  public getCurrentMatch(): RouteMatch | null {
    return this.currentMatch.value;
  }

  /**
   * Match a path without touching window.location
   * Useful for SSR, testing, and programmatic route matching
   */
  public match(
    path: string,
    options?: { readonly search?: string; readonly hash?: string },
  ): RouteMatch | null {
    return matchPath(
      path,
      this.staticRoutes,
      this.compiledRoutes.value,
      options,
    );
  }

  /**
   * Prefetch a route by path (preloads component for performance)
   */
  public async prefetch(path: string): Promise<void> {
    return prefetchRoute(path, (p) => this.matchRoute(p));
  }

  /**
   * Generate breadcrumbs for current route
   */
  public getBreadcrumbs(): ReadonlyArray<{
    readonly path: string;
    readonly title: string;
  }> {
    return generateBreadcrumbs(
      this.currentMatch.value,
      this.staticRoutes,
      this.compiledRoutes.value,
    );
  }

  /**
   * Clear the route matching cache
   */
  public clearCache(): void {
    this.routeCache.clear();
  }

  /**
   * Destroy router and clean up listeners
   */
  public destroy(): void {
    this.listeners.clear();
    this.currentNavigation.value?.abort();
    this.currentNavigation = { value: null };
    removeEventListeners(this.eventHandlers.value);
  }
}

/**
 * Create a type-safe router instance
 */
export function createRouter(config: RouterConfig): Router {
  return new Router(config);
}
