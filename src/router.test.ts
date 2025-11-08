/**
 * Tests for sane-router
 * Demonstrates how declarative design makes testing easy
 */

import { describe, it, expect, vi } from "vitest";
import { createRouter, route } from "./router.js";

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
      const callOrder: string[] = [];

      const router = createRouter({
        routes: [
          route("/test", {
            loader: async () => {
              await Promise.resolve(); // Make it truly async
              callOrder.push("loader");
            },
            component: async () => {
              await Promise.resolve(); // Make it truly async
              callOrder.push("component");
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
        router["staticRoutes"].size + router["compiledRoutes"].length,
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
        router["staticRoutes"].size + router["compiledRoutes"].length,
      ).toBe(2);
    });

    it("extracts parameter names at compile time", () => {
      const router = createRouter({
        routes: [
          route("/users/:userId/posts/:postId", { component: () => "post" }),
        ],
      });

      const compiled = router["compiledRoutes"][0];
      expect(compiled?.paramNames).toEqual(["userId", "postId"]);
    });
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
    expect(router["staticRoutes"].size + router["compiledRoutes"].length).toBe(
      6,
    );
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
    expect(router["staticRoutes"].size + router["compiledRoutes"].length).toBe(
      1,
    );
  });
});
