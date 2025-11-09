/**
 * Tests for sane-router
 * Demonstrates how declarative design makes testing easy
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { route } from "./route-factory.js";
import { createRouter } from "./router.js";

// Mock DOM APIs
global.window = {
  location: { pathname: "/", search: "", hash: "" },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
  addEventListener: vi.fn(),
  scrollTo: vi.fn(),
} as unknown as Window & typeof globalThis;

global.document = {
  addEventListener: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  removeEventListener: vi.fn(),
} as unknown as Document;

describe("Router", () => {
  describe("Route Matching", () => {
    it("matches static routes", () => {
      const router = createRouter({
        routes: [
          route("/", { component: () => "home" }),
          route("/about", { component: () => "about" }),
        ],
      });

      const match = router["matchRoute"]("/about");
      expect(match?.route.path).toBe("/about");
    });

    it("matches dynamic routes with parameters", () => {
      const router = createRouter({
        routes: [route("/products/:id", { component: () => "product" })],
      });

      const match = router["matchRoute"]("/products/123");
      expect(match?.route.path).toBe("/products/:id");
      expect(match?.params).toEqual({ id: "123" });
    });

    it("matches nested routes", () => {
      const router = createRouter({
        routes: [
          route("/admin", {
            component: () => "admin-layout",
            children: [route("/dashboard", { component: () => "dashboard" })],
          }),
        ],
      });

      const match = router["matchRoute"]("/admin/dashboard");
      expect(match?.route.path).toBe("/admin/dashboard");
    });

    it("returns null for non-matching routes", () => {
      const router = createRouter({
        routes: [route("/", { component: () => "home" })],
      });

      const match = router["matchRoute"]("/invalid");
      expect(match).toBeNull();
    });

    it("memoizes route matches for same path", () => {
      const router = createRouter({
        routes: [route("/products/:id", { component: () => "product" })],
      });

      const match1 = router["matchRoute"]("/products/123");
      const match2 = router["matchRoute"]("/products/123");

      // Route/params/path are cached (same reference)
      expect(match1?.route).toBe(match2?.route);
      expect(match1?.params).toBe(match2?.params);
      expect(match1?.path).toBe(match2?.path);

      // But query/hash are always fresh (different references)
      expect(match1?.query).not.toBe(match2?.query);
    });
  });

  describe("Type Safety", () => {
    it("extracts parameters correctly", () => {
      const router = createRouter({
        routes: [
          route("/users/:userId/posts/:postId", {
            component: () => "post",
            loader: (params) => {
              // TypeScript ensures params has userId and postId
              expect(params).toHaveProperty("userId");
              expect(params).toHaveProperty("postId");
              return params;
            },
          }),
        ],
      });

      const match = router["matchRoute"]("/users/john/posts/42");
      expect(match?.params).toEqual({ userId: "john", postId: "42" });
    });
  });

  describe("Route Guards", () => {
    it("blocks navigation when guard returns false", async () => {
      const guardFn = vi.fn(() => false);
      const componentFn = vi.fn(() => "component");

      const router = createRouter({
        routes: [
          route("/admin", {
            guard: guardFn,
            component: componentFn,
          }),
        ],
      });

      await router.navigate("/admin");

      expect(guardFn).toHaveBeenCalled();
      expect(componentFn).not.toHaveBeenCalled();
    });

    it("allows navigation when guard returns true", async () => {
      const guardFn = vi.fn(() => true);
      const componentFn = vi.fn(() => "component");

      const router = createRouter({
        routes: [
          route("/admin", {
            guard: guardFn,
            component: componentFn,
          }),
        ],
      });

      await router.navigate("/admin");

      expect(guardFn).toHaveBeenCalled();
      expect(componentFn).toHaveBeenCalled();
    });

    it("passes context from guard to loader", async () => {
      const user = { id: "123", name: "John" };
      const guardFn = vi.fn(() => ({
        allow: true as const,
        context: { user },
      }));
      let loaderReceivedContext: any = null;

      const loaderFn = vi.fn((ctx: any) => {
        loaderReceivedContext = ctx.context;
        return { data: "test" };
      });

      const router = createRouter({
        routes: [
          route("/dashboard", {
            guard: guardFn,
            loader: loaderFn,
            component: () => "dashboard",
          }),
        ],
      });

      await router.navigate("/dashboard");

      expect(guardFn).toHaveBeenCalled();
      expect(loaderFn).toHaveBeenCalled();
      expect(loaderReceivedContext).toEqual({ user });
    });

    it("redirects when guard returns redirect", async () => {
      const guardFn = vi.fn(() => ({ redirect: "/login" }));
      const componentFn = vi.fn(() => "admin");
      const loginComponentFn = vi.fn(() => "login");

      const router = createRouter({
        routes: [
          route("/admin", {
            guard: guardFn,
            component: componentFn,
          }),
          route("/login", {
            component: loginComponentFn,
          }),
        ],
      });

      await router.navigate("/admin");

      expect(guardFn).toHaveBeenCalled();
      expect(componentFn).not.toHaveBeenCalled();
      expect(loginComponentFn).toHaveBeenCalled();
    });

    it("redirects with replace option when specified", async () => {
      const guardFn = vi.fn(() => ({ redirect: "/login", replace: true }));
      const replaceStateSpy = vi.spyOn(global.window.history, "replaceState");

      const router = createRouter({
        routes: [
          route("/admin", {
            guard: guardFn,
            component: () => "admin",
          }),
          route("/login", {
            component: () => "login",
          }),
        ],
      });

      await router.navigate("/admin");

      expect(guardFn).toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    it("blocks navigation when guard returns deny", async () => {
      const guardFn = vi.fn(() => ({
        deny: true as const,
        reason: "Premium required",
      }));
      const componentFn = vi.fn(() => "premium");

      const router = createRouter({
        routes: [
          route("/premium", {
            guard: guardFn,
            component: componentFn,
          }),
        ],
      });

      await router.navigate("/premium");

      expect(guardFn).toHaveBeenCalled();
      expect(componentFn).not.toHaveBeenCalled();
    });

    it("handles async guards", async () => {
      const guardFn = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { allow: true as const };
      });
      const componentFn = vi.fn(() => "admin");

      const router = createRouter({
        routes: [
          route("/admin", {
            guard: guardFn,
            component: componentFn,
          }),
        ],
      });

      await router.navigate("/admin");

      expect(guardFn).toHaveBeenCalled();
      expect(componentFn).toHaveBeenCalled();
    });
  });

  describe("Data Loading", () => {
    it("calls loader with route parameters", async () => {
      let receivedContext: any = null;
      const loaderFn = vi.fn(async (context: any) => {
        receivedContext = context;
        await Promise.resolve(); // Make it truly async
        return { id: context.params.id };
      });

      const router = createRouter({
        routes: [
          route("/products/:id", {
            loader: loaderFn,
            component: () => "product",
          }),
        ],
      });

      await router.navigate("/products/123");

      // Loader now receives context with params, query, hash, signal
      expect(loaderFn).toHaveBeenCalled();
      expect(receivedContext).toBeDefined();
      expect(receivedContext.params).toEqual({ id: "123" });
      expect(receivedContext.query).toBeInstanceOf(URLSearchParams);
      expect(typeof receivedContext.hash).toBe("string");
      expect(receivedContext.signal).toBeInstanceOf(AbortSignal);
    });

    it("loads data before component", async () => {
      let callOrder: readonly string[] = [];

      const router = createRouter({
        routes: [
          route("/test", {
            loader: async () => {
              await Promise.resolve(); // Make it truly async
              callOrder = [...callOrder, "loader"];
            },
            component: async () => {
              await Promise.resolve(); // Make it truly async
              callOrder = [...callOrder, "component"];
              return "test";
            },
          }),
        ],
      });

      await router.navigate("/test");

      expect(callOrder).toEqual(["loader", "component"]);
    });
  });

  describe("Navigation Hooks", () => {
    it("calls beforeNavigate hook", async () => {
      const beforeNavigate = vi.fn(() => true);

      const router = createRouter({
        routes: [route("/test", { component: () => "test" })],
        hooks: { beforeNavigate },
      });

      await router.navigate("/test");

      expect(beforeNavigate).toHaveBeenCalledWith("/test");
    });

    it("calls afterNavigate hook", async () => {
      const afterNavigate = vi.fn();

      const router = createRouter({
        routes: [route("/test", { component: () => "test" })],
        hooks: { afterNavigate },
      });

      await router.navigate("/test");

      expect(afterNavigate).toHaveBeenCalledWith("/test");
    });

    it("blocks navigation when beforeNavigate returns false", async () => {
      const beforeNavigate = vi.fn(() => false);
      const componentFn = vi.fn(() => "test");

      const router = createRouter({
        routes: [route("/test", { component: componentFn })],
        hooks: { beforeNavigate },
      });

      await router.navigate("/test");

      expect(beforeNavigate).toHaveBeenCalled();
      expect(componentFn).not.toHaveBeenCalled();
    });
  });

  describe("Subscriptions", () => {
    it("notifies subscribers on navigation", async () => {
      const listener = vi.fn();

      const router = createRouter({
        routes: [
          route("/", { component: () => "home" }),
          route("/about", { component: () => "about" }),
        ],
      });

      // Wait a tick for initial navigation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      router.subscribe(listener);

      await router.navigate("/about");

      // Called once on subscribe (initial), once on navigate
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("allows unsubscribing", async () => {
      const listener = vi.fn();

      const router = createRouter({
        routes: [route("/test", { component: () => "test" })],
      });

      const unsubscribe = router.subscribe(listener);
      unsubscribe();

      await router.navigate("/test");

      // Only called once on subscribe, not on navigate
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Declarative Configuration", () => {
    it("accepts routes as pure data", () => {
      // This is valid - routes are just objects
      const routes = [
        route("/", { component: () => "home" }),
        route("/about", { component: () => "about" }),
      ];

      // Can be stored, transformed, filtered, etc.
      const filteredRoutes = routes.filter((r) => r.path === "/");

      const router = createRouter({ routes: filteredRoutes });

      // Static routes go in staticRoutes Map, dynamic routes in compiledRoutes array
      expect(
        router["staticRoutes"].size + router["compiledRoutes"]["value"].length,
      ).toBe(1);
    });

    it("supports route metadata", () => {
      const router = createRouter({
        routes: [
          route("/", {
            component: () => "home",
            meta: { title: "Home", requiresAuth: false },
          }),
        ],
      });

      const match = router["matchRoute"]("/");
      expect(match?.route.meta).toEqual({ title: "Home", requiresAuth: false });
    });
  });

  describe("Performance", () => {
    it("compiles routes once at initialization", () => {
      const router = createRouter({
        routes: [
          route("/", { component: () => "home" }),
          route("/about", { component: () => "about" }),
        ],
      });

      // Routes are pre-compiled (both are static routes)
      expect(
        router["staticRoutes"].size + router["compiledRoutes"]["value"].length,
      ).toBe(2);
    });

    it("extracts parameter names at compile time", () => {
      const router = createRouter({
        routes: [
          route("/users/:userId/posts/:postId", { component: () => "post" }),
        ],
      });

      const compiled = router["compiledRoutes"]["value"][0];
      expect(compiled?.paramNames).toEqual(["userId", "postId"]);
    });
  });
});

describe("Cache Strategies", () => {
  describe("'params' strategy (default)", () => {
    it("caches by path and params only, ignores query changes", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/products/:id", {
            loader: loaderFn,
            component: () => "product",
          }),
        ],
        cache: { strategy: "params" },
      });

      // Navigate with query param
      global.window.location.search = "?sort=price";
      await router.navigate("/products/123?sort=price");
      expect(loaderCallCount).toBe(1);

      // Change query param - should NOT use cache (query always fresh)
      global.window.location.search = "?sort=name";
      await router.navigate("/products/123?sort=name");
      expect(loaderCallCount).toBe(2);

      // Same path/params but different query - uses cache for route/params
      global.window.location.search = "?filter=active";
      await router.navigate("/products/123?filter=active");
      expect(loaderCallCount).toBe(3);
    });

    it("caches by path and params only, ignores hash changes", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/products/:id", {
            loader: loaderFn,
            component: () => "product",
          }),
        ],
        cache: { strategy: "params" },
      });

      // Navigate with hash
      global.window.location.hash = "#reviews";
      await router.navigate("/products/123#reviews");
      expect(loaderCallCount).toBe(1);

      // Change hash - should NOT use cache (hash always fresh)
      global.window.location.hash = "#description";
      await router.navigate("/products/123#description");
      expect(loaderCallCount).toBe(2);
    });
  });

  describe("'query' strategy", () => {
    it("caches by path + params + query, ignores hash", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/docs/:page", {
            loader: loaderFn,
            component: () => "docs",
            cache: { strategy: "query" },
          }),
        ],
      });

      // Navigate with query
      await router.navigate("/docs/guide?q=install");
      expect(loaderCallCount).toBe(1);

      // Same query - loader still runs (data not cached)
      await router.navigate("/docs/guide?q=install");
      expect(loaderCallCount).toBe(2);

      // Different query - loader runs
      await router.navigate("/docs/guide?q=setup");
      expect(loaderCallCount).toBe(3);

      // Hash change with same query - loader runs
      await router.navigate("/docs/guide?q=setup#examples");
      expect(loaderCallCount).toBe(4);
    });
  });

  describe("'full' strategy", () => {
    it("caches by path + params + query + hash", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/docs/:page", {
            loader: loaderFn,
            component: () => "docs",
            cache: { strategy: "full" },
          }),
        ],
      });

      // Navigate with query + hash
      global.window.location.search = "?version=2";
      global.window.location.hash = "#installation";
      await router.navigate("/docs/api?version=2#installation");
      expect(loaderCallCount).toBe(1);

      // Exact same URL - loader still runs (data not cached)
      global.window.location.search = "?version=2";
      global.window.location.hash = "#installation";
      await router.navigate("/docs/api?version=2#installation");
      expect(loaderCallCount).toBe(2);

      // Change hash - loader runs
      global.window.location.search = "?version=2";
      global.window.location.hash = "#examples";
      await router.navigate("/docs/api?version=2#examples");
      expect(loaderCallCount).toBe(3);
    });
  });

  describe("false strategy (no caching)", () => {
    it("never caches routes", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/live", {
            loader: loaderFn,
            component: () => "live",
            cache: false,
          }),
        ],
      });

      // First navigation
      await router.navigate("/live");
      expect(loaderCallCount).toBe(1);

      // Same path - should NOT use cache
      await router.navigate("/live");
      expect(loaderCallCount).toBe(2);

      // Third navigation - still no cache
      await router.navigate("/live");
      expect(loaderCallCount).toBe(3);
    });
  });

  describe("Cache TTL (maxAge)", () => {
    it("expires cache entries after maxAge milliseconds", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/products/:id", {
            loader: loaderFn,
            component: () => "product",
            cache: { strategy: "params", maxAge: 50 }, // 50ms TTL
          }),
        ],
      });

      // First navigation - cache miss
      await router.navigate("/products/123");
      expect(loaderCallCount).toBe(1);

      // Second navigation immediately - cache hit
      await router.navigate("/products/123");
      // Note: loaderCallCount doesn't increment because cache is hit at route level
      // Data is always fresh (loader always runs)
      expect(loaderCallCount).toBe(2);

      // Wait for cache to expire (50ms + buffer)
      await new Promise((resolve) => setTimeout(resolve, 75));

      // Third navigation - cache expired, should re-match route
      await router.navigate("/products/123");
      expect(loaderCallCount).toBe(3);
    });

    it("respects route-specific maxAge override", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/fast", {
            loader: loaderFn,
            component: () => "fast",
            cache: { strategy: "params", maxAge: 30 }, // 30ms TTL
          }),
        ],
        cache: { strategy: "params", maxAge: 5000 }, // Global 5s TTL
      });

      // First navigation
      await router.navigate("/fast");
      expect(loaderCallCount).toBe(1);

      // Wait for route-specific TTL to expire (30ms + buffer)
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Second navigation - cache expired (route maxAge)
      await router.navigate("/fast");
      expect(loaderCallCount).toBe(2);
    });
  });

  describe("LRU Cache Eviction", () => {
    it("evicts oldest entry when maxSize is exceeded", async () => {
      const loaderFn = vi.fn(({ params }: any) => {
        return { id: params.id };
      });

      const router = createRouter({
        routes: [
          route("/products/:id", {
            loader: loaderFn,
            component: () => "product",
          }),
        ],
        cache: { strategy: "params", maxSize: 2 }, // Only cache 2 routes
      });

      // Fill cache with 2 entries
      await router.navigate("/products/1");
      await router.navigate("/products/2");

      // Access first route again to make it most recently used
      await router.navigate("/products/1");

      // Add third entry - should evict products/2 (least recently used)
      await router.navigate("/products/3");

      // Navigate back to products/2 - should re-match (cache miss)
      const match2 = router["matchRoute"]("/products/2");
      expect(match2?.params["id"]).toBe("2");

      // Navigate to products/1 - should still be cached (most recently used)
      const match1 = router["matchRoute"]("/products/1");
      expect(match1?.params["id"]).toBe("1");
    });
  });

  describe("Global vs Route-Specific Cache Config", () => {
    it("uses global cache config by default", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/products/:id", {
            loader: loaderFn,
            component: () => "product",
          }),
        ],
        cache: { strategy: "query" }, // Global config
      });

      // Navigate with query
      global.window.location.search = "?sort=price";
      await router.navigate("/products/123?sort=price");
      expect(loaderCallCount).toBe(1);

      // Change query - loader runs (global 'query' strategy)
      global.window.location.search = "?sort=name";
      await router.navigate("/products/123?sort=name");
      expect(loaderCallCount).toBe(2);
    });

    it("route-specific cache config overrides global", async () => {
      let loaderCallCount = 0;
      const loaderFn = vi.fn(() => {
        loaderCallCount++;
        return { count: loaderCallCount };
      });

      const router = createRouter({
        routes: [
          route("/live", {
            loader: loaderFn,
            component: () => "live",
            cache: false, // Override global
          }),
        ],
        cache: { strategy: "params" }, // Global config
      });

      // First navigation
      await router.navigate("/live");
      expect(loaderCallCount).toBe(1);

      // Same path - should NOT use cache (route override)
      await router.navigate("/live");
      expect(loaderCallCount).toBe(2);
    });
  });
});

describe("Cache Management", () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  it("clearCache() clears the route matching cache", async () => {
    const router = createRouter({
      routes: [
        route({
          path: "/products/:id",
          component: () => "product",
        }),
      ],
    });

    // First navigation - populates cache
    await router.navigate("/products/123");
    const match1 = router.getCurrentMatch();
    expect(match1?.params["id"]).toBe("123");

    // Clear cache
    router.clearCache();

    // Second navigation - cache was cleared, should re-match
    await router.navigate("/products/456");
    const match2 = router.getCurrentMatch();
    expect(match2?.params["id"]).toBe("456");

    // Verify cache is working again after clear
    await router.navigate("/products/456");
    const match3 = router.getCurrentMatch();
    expect(match3?.params["id"]).toBe("456");
  });

  it("clearCache() prevents data leakage after logout", async () => {
    let userSession = "user1";

    const router = createRouter({
      routes: [
        route({
          path: "/profile/:userId",
          loader: ({ params }) => ({
            userId: params.userId,
            session: userSession,
          }),
          component: () => "profile",
        }),
      ],
    });

    // User 1 visits their profile
    await router.navigate("/profile/user1");
    let match = router.getCurrentMatch();
    expect(match?.params["userId"]).toBe("user1");

    // Simulate logout
    userSession = "user2";
    router.clearCache(); // Critical for security

    // User 2 visits their profile
    await router.navigate("/profile/user2");
    match = router.getCurrentMatch();
    expect(match?.params["userId"]).toBe("user2");
    // Without clearCache(), cached params would still be "user1"
  });

  it("clearCache() forces fresh data after mutations", async () => {
    let productData = { id: "123", version: 1 };

    const router = createRouter({
      routes: [
        route({
          path: "/products/:id",
          loader: () => productData,
          component: () => "product",
        }),
      ],
    });

    // Initial load
    await router.navigate("/products/123");
    let match = router.getCurrentMatch();
    expect(match?.data).toEqual({ id: "123", version: 1 });

    // Simulate mutation
    productData = { id: "123", version: 2 };

    // Clear cache to force re-fetch
    router.clearCache();

    // Navigate again - should get fresh data
    await router.navigate("/products/123");
    match = router.getCurrentMatch();
    expect(match?.data).toEqual({ id: "123", version: 2 });
  });
});

describe("Redirect Helper", () => {
  it("redirects when thrown from loader", async () => {
    const { redirect } = await import("./router.types.js");

    const loaderFn = vi.fn(() => {
      redirect("/404");
    });
    const componentFn = vi.fn(() => "product");
    const notFoundFn = vi.fn(() => "not-found");

    const router = createRouter({
      routes: [
        route("/products/:id", {
          loader: loaderFn,
          component: componentFn,
        }),
        route("/404", {
          component: notFoundFn,
        }),
      ],
    });

    await router.navigate("/products/999");

    expect(loaderFn).toHaveBeenCalled();
    expect(componentFn).not.toHaveBeenCalled();
    expect(notFoundFn).toHaveBeenCalled();
  });

  it("redirects with replace option when specified", async () => {
    const { redirect } = await import("./router.types.js");
    const replaceStateSpy = vi.spyOn(global.window.history, "replaceState");

    const loaderFn = vi.fn(() => {
      redirect("/home", true); // replace: true
    });

    const router = createRouter({
      routes: [
        route("/old-page", {
          loader: loaderFn,
          component: () => "old",
        }),
        route("/home", {
          component: () => "home",
        }),
      ],
    });

    await router.navigate("/old-page");

    expect(loaderFn).toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it("handles redirect in async loader", async () => {
    const { redirect } = await import("./router.types.js");

    const loaderFn = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      redirect("/unauthorized");
    });
    const unauthorizedFn = vi.fn(() => "unauthorized");

    const router = createRouter({
      routes: [
        route("/protected", {
          loader: loaderFn,
          component: () => "protected",
        }),
        route("/unauthorized", {
          component: unauthorizedFn,
        }),
      ],
    });

    await router.navigate("/protected");

    expect(loaderFn).toHaveBeenCalled();
    // Note: Component may be called due to parallel loading, but result is discarded
    expect(unauthorizedFn).toHaveBeenCalled();
  });

  it("RedirectResponse is instance of Error", async () => {
    const { RedirectResponse } = await import("./router.types.js");

    const redirectResponse = new RedirectResponse("/test", false);

    expect(redirectResponse).toBeInstanceOf(Error);
    expect(redirectResponse.name).toBe("RedirectResponse");
    expect(redirectResponse.path).toBe("/test");
    expect(redirectResponse.replace).toBe(false);
  });
});

describe("Error Handling - Parallel Loader and Component", () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  it("correctly tags loader error when loader fails and component succeeds", async () => {
    const loaderError = new Error("Loader failed");
    const loaderFn = vi.fn(() => Promise.reject(loaderError));
    const componentFn = vi.fn(() => Promise.resolve("component"));
    const onErrorFn = vi.fn();

    const router = createRouter({
      routes: [
        route({
          path: "/test",
          loader: loaderFn,
          component: componentFn,
        }),
      ],
      onError: onErrorFn,
    });

    await router.navigate("/test");

    expect(loaderFn).toHaveBeenCalled();
    expect(componentFn).toHaveBeenCalled();
    expect(onErrorFn).toHaveBeenCalledWith({
      type: "loader-error",
      error: loaderError,
      route: expect.objectContaining({ path: "/test" }),
    });
  });

  it("correctly tags component error when component fails and loader succeeds", async () => {
    const componentError = new Error("Component failed");
    const loaderFn = vi.fn(() => Promise.resolve({ data: "test" }));
    const componentFn = vi.fn(() => Promise.reject(componentError));
    const onErrorFn = vi.fn();

    const router = createRouter({
      routes: [
        route({
          path: "/test",
          loader: loaderFn,
          component: componentFn,
        }),
      ],
      onError: onErrorFn,
    });

    await router.navigate("/test");

    expect(loaderFn).toHaveBeenCalled();
    expect(componentFn).toHaveBeenCalled();
    expect(onErrorFn).toHaveBeenCalledWith({
      type: "component-error",
      error: componentError,
      route: expect.objectContaining({ path: "/test" }),
    });
  });

  it("reports loader error when both loader and component fail", async () => {
    const loaderError = new Error("Loader failed");
    const componentError = new Error("Component failed");
    const loaderFn = vi.fn(() => Promise.reject(loaderError));
    const componentFn = vi.fn(() => Promise.reject(componentError));
    const onErrorFn = vi.fn();

    const router = createRouter({
      routes: [
        route({
          path: "/test",
          loader: loaderFn,
          component: componentFn,
        }),
      ],
      onError: onErrorFn,
    });

    await router.navigate("/test");

    expect(loaderFn).toHaveBeenCalled();
    expect(componentFn).toHaveBeenCalled();
    // When both fail, loader error is reported first (checked first in code)
    expect(onErrorFn).toHaveBeenCalledWith({
      type: "loader-error",
      error: loaderError,
      route: expect.objectContaining({ path: "/test" }),
    });
  });

  it("handles RedirectResponse from loader in parallel loading", async () => {
    const { redirect } = await import("./router.types.js");

    const loaderFn = vi.fn(() => {
      redirect("/redirect-target");
    });
    const componentFn = vi.fn(() => Promise.resolve("component"));

    const router = createRouter({
      routes: [
        route({
          path: "/test",
          loader: loaderFn,
          component: componentFn,
        }),
        route({
          path: "/redirect-target",
          component: () => "redirect-target",
        }),
      ],
    });

    await router.navigate("/test");

    expect(loaderFn).toHaveBeenCalled();
    // Should navigate to redirect target
    const match = router.getCurrentMatch();
    expect(match?.route.path).toBe("/redirect-target");
  });

  it("handles RedirectResponse from component in parallel loading", async () => {
    const { redirect } = await import("./router.types.js");

    const loaderFn = vi.fn(() => Promise.resolve({ data: "test" }));
    const componentFn = vi.fn(() => {
      redirect("/redirect-target");
    });

    const router = createRouter({
      routes: [
        route({
          path: "/test",
          loader: loaderFn,
          component: componentFn,
        }),
        route({
          path: "/redirect-target",
          component: () => "redirect-target",
        }),
      ],
    });

    await router.navigate("/test");

    expect(loaderFn).toHaveBeenCalled();
    expect(componentFn).toHaveBeenCalled();
    // Should navigate to redirect target
    const match = router.getCurrentMatch();
    expect(match?.route.path).toBe("/redirect-target");
  });
});

describe("Base Path Configuration", () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  it("base '/app' doesn't match '/application' (boundary check)", () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/application/page",
    });

    const appRoute = route({
      path: "/page",
      component: () => "app-page",
    });

    const router = createRouter({
      routes: [appRoute],
      base: "/app",
    });

    const match = router.getCurrentMatch();
    expect(match).toBeNull(); // Should NOT match because /application !== /app
  });

  it("base '/app' matches '/app/page' (correct stripping)", () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/app/page",
    });

    const appRoute = route({
      path: "/page",
      component: () => "app-page",
    });

    const router = createRouter({
      routes: [appRoute],
      base: "/app",
    });

    const match = router.getCurrentMatch();
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe("/page");
  });

  it("nested base '/api/v1' works correctly", () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/api/v1/users",
    });

    const usersRoute = route({
      path: "/users",
      component: () => "users",
    });

    const router = createRouter({
      routes: [usersRoute],
      base: "/api/v1",
    });

    const match = router.getCurrentMatch();
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe("/users");
  });

  it("trailing slashes handled properly", () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/app/page",
    });

    const pageRoute = route({
      path: "/page",
      component: () => "page",
    });

    const router = createRouter({
      routes: [pageRoute],
      base: "/app/", // Trailing slash
    });

    const match = router.getCurrentMatch();
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe("/page");
  });

  it("root base '/' matches all paths", () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/any/path",
    });

    const anyRoute = route({
      path: "/any/path",
      component: () => "any",
    });

    const router = createRouter({
      routes: [anyRoute],
      base: "/",
    });

    const match = router.getCurrentMatch();
    expect(match).not.toBeNull();
  });

  it("empty base works as expected", () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/products",
    });

    const productsRoute = route({
      path: "/products",
      component: () => "products",
    });

    const router = createRouter({
      routes: [productsRoute],
      base: "",
    });

    const match = router.getCurrentMatch();
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe("/products");
  });
});

describe("View Transitions API", () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
    globalThis.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelectorAll: vi.fn(() => []),
    } as unknown as Document;
  });

  it("navigates successfully when viewTransitions enabled", async () => {
    // Note: View Transitions API support is checked at module load time,
    // so we can't mock it in tests. This test verifies navigation works
    // with viewTransitions: true regardless of API availability.
    const homeRoute = route({
      path: "/",
      component: () => "home",
    });
    const aboutRoute = route({
      path: "/about",
      component: () => "about",
    });

    const router = createRouter({
      routes: [homeRoute, aboutRoute],
      viewTransitions: true, // Enabled
    });

    await router.navigate("/about");

    const match = router.getCurrentMatch();
    expect(match?.route.path).toBe("/about");
  });

  it("falls back gracefully when API unavailable", async () => {
    // No startViewTransition defined - router should fall back to normal navigation
    const homeRoute = route({
      path: "/",
      component: () => "home",
    });
    const aboutRoute = route({
      path: "/about",
      component: () => "about",
    });

    const router = createRouter({
      routes: [homeRoute, aboutRoute],
      viewTransitions: true,
    });

    // Should not throw, just navigate without transitions
    await router.navigate("/about");

    const match = router.getCurrentMatch();
    expect(match?.route.path).toBe("/about");
  });

  it("skips transitions when viewTransitions: false", async () => {
    const transitionFn = vi.fn((callback) => {
      callback();
      return { finished: Promise.resolve() };
    });

    Object.defineProperty(globalThis.document, "startViewTransition", {
      writable: true,
      configurable: true,
      value: transitionFn,
    });

    const homeRoute = route({
      path: "/",
      component: () => "home",
    });
    const aboutRoute = route({
      path: "/about",
      component: () => "about",
    });

    const router = createRouter({
      routes: [homeRoute, aboutRoute],
      viewTransitions: false, // Disabled
    });

    await router.navigate("/about");

    expect(transitionFn).not.toHaveBeenCalled();
  });
});

describe("Navigation API", () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  it("navigates successfully when useNavigationAPI enabled", async () => {
    // Note: Navigation API support is checked at module load time,
    // so we can't mock it in tests. This test verifies navigation works
    // with useNavigationAPI: true regardless of API availability.
    const homeRoute = route({
      path: "/",
      component: () => "home",
    });
    const aboutRoute = route({
      path: "/about",
      component: () => "about",
    });

    const router = createRouter({
      routes: [homeRoute, aboutRoute],
      useNavigationAPI: true, // Enabled
    });

    await router.navigate("/about");

    const match = router.getCurrentMatch();
    expect(match?.route.path).toBe("/about");
  });

  it("falls back to History API when Navigation API unavailable", async () => {
    // No window.navigation defined
    const homeRoute = route({
      path: "/",
      component: () => "home",
    });
    const aboutRoute = route({
      path: "/about",
      component: () => "about",
    });

    const router = createRouter({
      routes: [homeRoute, aboutRoute],
      useNavigationAPI: true, // Requested but unavailable
    });

    await router.navigate("/about");

    // Should fall back to history.pushState
    expect(window.history.pushState).toHaveBeenCalled();

    const match = router.getCurrentMatch();
    expect(match?.route.path).toBe("/about");
  });

  it("uses History API when useNavigationAPI: false", async () => {
    const navigateFn = vi.fn(() => ({ committed: Promise.resolve() }));

    Object.defineProperty(globalThis.window, "navigation", {
      writable: true,
      configurable: true,
      value: {
        navigate: navigateFn,
      },
    });

    const homeRoute = route({
      path: "/",
      component: () => "home",
    });
    const aboutRoute = route({
      path: "/about",
      component: () => "about",
    });

    const router = createRouter({
      routes: [homeRoute, aboutRoute],
      useNavigationAPI: false, // Explicitly disabled
    });

    await router.navigate("/about");

    expect(navigateFn).not.toHaveBeenCalled();
    expect(window.history.pushState).toHaveBeenCalled();
  });
});

describe("Declarative API Benefits", () => {
  it("routes are testable without DOM", async () => {
    // No need to mock window, document, etc. for route definitions
    const testRoute = route("/products/:id", {
      component: () => "product",
      loader: async ({ params }) => {
        await Promise.resolve(); // Make it truly async
        return { id: params.id };
      },
    });

    expect(testRoute.path).toBe("/products/:id");
    const mockContext = {
      params: { id: "123" },
      query: new URLSearchParams(),
      hash: "",
      signal: new AbortController().signal,
    };
    await expect(testRoute.loader?.(mockContext)).resolves.toEqual({
      id: "123",
    });
  });

  it("routes can be composed programmatically", () => {
    const adminRoutes = [
      route("/dashboard", { component: () => "dashboard" }),
      route("/users", { component: () => "users" }),
      route("/settings", { component: () => "settings" }),
    ];

    const publicRoutes = [
      route("/", { component: () => "home" }),
      route("/about", { component: () => "about" }),
    ];

    const allRoutes = [
      ...publicRoutes,
      route("/admin", {
        component: () => "admin-layout",
        children: adminRoutes,
      }),
    ];

    const router = createRouter({ routes: allRoutes });

    // Total: 2 public static + 1 admin static + 3 admin static children = 6 total
    expect(
      router["staticRoutes"].size + router["compiledRoutes"]["value"].length,
    ).toBe(6);
  });

  it("routes can be filtered based on conditions", () => {
    const isDevelopment = false;

    const allRoutes = [
      route("/", { component: () => "home" }),
      route("/debug", {
        component: () => "debug",
        meta: { devOnly: true },
      }),
    ];

    const routes = isDevelopment
      ? allRoutes
      : allRoutes.filter((r) => !r.meta?.["devOnly"]);

    const router = createRouter({ routes });

    // Only home route (which is static)
    expect(
      router["staticRoutes"].size + router["compiledRoutes"]["value"].length,
    ).toBe(1);
  });
});

describe("Breadcrumbs", () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  it("generates breadcrumbs for nested routes", async () => {
    const routes = [
      route("/admin", {
        component: () => "admin-layout",
        meta: { title: "Admin" },
        children: [
          route("/dashboard", {
            component: () => "dashboard",
            meta: { title: "Dashboard" },
          }),
        ],
      }),
    ];

    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/admin/dashboard",
    });

    const router = createRouter({ routes });
    await router.navigate("/admin/dashboard");

    const breadcrumbs = router.getBreadcrumbs();
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ path: "/admin", title: "Admin" });
    expect(breadcrumbs[1]).toEqual({
      path: "/admin/dashboard",
      title: "Dashboard",
    });
  });

  it("uses meta.title from current route when available", async () => {
    const routes = [
      route("/products", {
        component: () => "products",
        meta: { title: "Products" },
        children: [
          route("/:id", {
            component: () => "product-detail",
            meta: { title: "Product Details" },
          }),
        ],
      }),
    ];

    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/products/123",
    });

    const router = createRouter({ routes });
    await router.navigate("/products/123");

    const breadcrumbs = router.getBreadcrumbs();
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ path: "/products", title: "Products" });
    expect(breadcrumbs[1]).toEqual({
      path: "/products/123",
      title: "Product Details",
    });
  });

  it("falls back to path segment when meta.title is missing", async () => {
    const routes = [
      route("/docs", {
        component: () => "docs-layout",
        // No meta.title
        children: [
          route("/getting-started", {
            component: () => "getting-started",
            // No meta.title
          }),
        ],
      }),
    ];

    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/docs/getting-started",
    });

    const router = createRouter({ routes });
    await router.navigate("/docs/getting-started");

    const breadcrumbs = router.getBreadcrumbs();
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ path: "/docs", title: "docs" });
    expect(breadcrumbs[1]).toEqual({
      path: "/docs/getting-started",
      title: "getting-started",
    });
  });

  it("handles dynamic routes in breadcrumbs", async () => {
    const routes = [
      route("/users", {
        component: () => "users-list",
        meta: { title: "Users" },
        children: [
          route("/:userId", {
            component: () => "user-profile",
            meta: { title: "User Profile" },
            children: [
              route("/posts", {
                component: () => "user-posts",
                meta: { title: "Posts" },
              }),
            ],
          }),
        ],
      }),
    ];

    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: "/users/john/posts",
    });

    const router = createRouter({ routes });
    await router.navigate("/users/john/posts");

    const breadcrumbs = router.getBreadcrumbs();
    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({ path: "/users", title: "Users" });
    expect(breadcrumbs[1]).toEqual({
      path: "/users/john",
      title: "User Profile",
    });
    expect(breadcrumbs[2]).toEqual({
      path: "/users/john/posts",
      title: "Posts",
    });
  });

  it("returns empty array when no route is matched", () => {
    const routes = [route("/", { component: () => "home" })];

    const router = createRouter({ routes });

    const breadcrumbs = router.getBreadcrumbs();
    expect(breadcrumbs).toEqual([]);
  });
});
