import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildPath,
  buildQuery,
  buildUrl,
  preloadRoute,
  preloadRoutes,
  debounce,
  PerformanceMonitor,
  ScrollRestoration,
  generateBreadcrumbs,
  pathMatches,
  getActiveClass,
  createRouteBuilder,
  validatePath,
} from './utils';
import type { Route, RouteMatch } from './router.types';

// Mock DOM APIs for browser-dependent utilities
global.window = {
  scrollY: 0,
  scrollTo: vi.fn(),
} as any;

describe('Pure Functions', () => {
  describe('buildPath', () => {
    it('builds path without parameters', () => {
      const result = buildPath('/home', {});
      expect(result).toBe('/home');
    });

    it('builds path with single parameter', () => {
      const result = buildPath('/users/:id', { id: '123' });
      expect(result).toBe('/users/123');
    });

    it('builds path with multiple parameters', () => {
      const result = buildPath('/users/:userId/posts/:postId', {
        userId: '123',
        postId: '456',
      });
      expect(result).toBe('/users/123/posts/456');
    });

    it('encodes parameter values', () => {
      const result = buildPath('/search/:query', { query: 'hello world' });
      expect(result).toBe('/search/hello%20world');
    });

    it('encodes special characters', () => {
      const result = buildPath('/tag/:name', { name: 'foo/bar?baz' });
      expect(result).toBe('/tag/foo%2Fbar%3Fbaz');
    });

    it('handles empty parameter value', () => {
      const result = buildPath('/users/:id', { id: '' });
      expect(result).toBe('/users/');
    });
  });

  describe('buildQuery', () => {
    it('builds empty query string for empty params', () => {
      const result = buildQuery({});
      expect(result).toBe('');
    });

    it('builds query string with single parameter', () => {
      const result = buildQuery({ page: '1' });
      expect(result).toBe('?page=1');
    });

    it('builds query string with multiple parameters', () => {
      const result = buildQuery({ page: '1', limit: '10' });
      expect(result).toMatch(/^\?/);
      expect(result).toContain('page=1');
      expect(result).toContain('limit=10');
    });

    it('skips undefined values', () => {
      const result = buildQuery({ page: '1', sort: undefined });
      expect(result).toBe('?page=1');
    });

    it('converts non-string values to strings', () => {
      const result = buildQuery({ page: 1 as any, active: true as any });
      expect(result).toContain('page=1');
      expect(result).toContain('active=true');
    });

    it('encodes query parameter values', () => {
      const result = buildQuery({ search: 'hello world' });
      expect(result).toBe('?search=hello+world');
    });
  });

  describe('buildUrl', () => {
    it('builds URL without query parameters', () => {
      const result = buildUrl('/users/:id', { id: '123' }, undefined);
      expect(result).toBe('/users/123');
    });

    it('builds URL with query parameters', () => {
      const result = buildUrl('/users/:id', { id: '123' }, { page: '1' });
      expect(result).toBe('/users/123?page=1');
    });

    it('builds URL with multiple path and query params', () => {
      const result = buildUrl(
        '/users/:userId/posts/:postId',
        { userId: '123', postId: '456' },
        { sort: 'date', order: 'desc' }
      );
      expect(result).toContain('/users/123/posts/456');
      expect(result).toContain('sort=date');
      expect(result).toContain('order=desc');
    });
  });

  describe('pathMatches', () => {
    it('matches exact paths when exact=true', () => {
      expect(pathMatches('/home', '/home', true)).toBe(true);
      expect(pathMatches('/home/about', '/home', true)).toBe(false);
    });

    it('matches prefix paths when exact=false', () => {
      expect(pathMatches('/home', '/home', false)).toBe(true);
      expect(pathMatches('/home/about', '/home', false)).toBe(true);
      expect(pathMatches('/about', '/home', false)).toBe(false);
    });

    it('defaults to prefix matching', () => {
      expect(pathMatches('/home/about', '/home')).toBe(true);
    });
  });

  describe('getActiveClass', () => {
    it('returns active class when path matches', () => {
      const result = getActiveClass('/home', '/home', 'active');
      expect(result).toBe('active');
    });

    it('returns empty string when path does not match', () => {
      const result = getActiveClass('/about', '/home', 'active');
      expect(result).toBe('');
    });

    it('uses default "active" class name', () => {
      const result = getActiveClass('/home', '/home');
      expect(result).toBe('active');
    });

    it('respects exact matching flag', () => {
      const result = getActiveClass('/home/about', '/home', 'active', true);
      expect(result).toBe('');
    });

    it('supports custom class names', () => {
      const result = getActiveClass('/home', '/home', 'is-active');
      expect(result).toBe('is-active');
    });
  });

  describe('generateBreadcrumbs', () => {
    it('returns empty array for null match', () => {
      const result = generateBreadcrumbs(null);
      expect(result).toEqual([]);
    });

    it('generates breadcrumbs from path segments', () => {
      const match: RouteMatch = {
        path: '/users/123/posts',
        route: { path: '/users/:id/posts', component: () => ({}) } as any,
        params: {} as any,
        query: new URLSearchParams(),
        hash: '',
      };

      const result = generateBreadcrumbs(match);
      expect(result).toEqual([
        { path: '/users', title: 'users' },
        { path: '/users/123', title: '123' },
        { path: '/users/123/posts', title: 'posts' },
      ]);
    });

    it('uses route meta title if available', () => {
      const match: RouteMatch = {
        path: '/users',
        route: {
          path: '/users',
          component: () => ({}),
          meta: { title: 'User Management' },
        } as any,
        params: {} as any,
        query: new URLSearchParams(),
        hash: '',
      };

      const result = generateBreadcrumbs(match);
      expect(result).toEqual([{ path: '/users', title: 'User Management' }]);
    });

    it('handles root path', () => {
      const match: RouteMatch = {
        path: '/',
        route: { path: '/', component: () => ({}) } as any,
        params: {} as any,
        query: new URLSearchParams(),
        hash: '',
      };

      const result = generateBreadcrumbs(match);
      expect(result).toEqual([]);
    });
  });

  describe('validatePath', () => {
    const routes: ReadonlyArray<Route> = [
      { path: '/home', component: () => ({}) },
      { path: '/users/:id', component: () => ({}) },
      { path: '/about', component: () => ({}) },
    ] as any;

    it('returns true for valid path', () => {
      expect(validatePath(routes, '/home')).toBe(true);
      expect(validatePath(routes, '/about')).toBe(true);
    });

    it('returns false for invalid path', () => {
      expect(validatePath(routes, '/invalid')).toBe(false);
    });

    it('validates exact path match', () => {
      expect(validatePath(routes, '/users/:id')).toBe(true);
      expect(validatePath(routes, '/users/123')).toBe(false);
    });
  });

  describe('createRouteBuilder', () => {
    const routes = [
      { path: '/home', component: () => ({}) },
      { path: '/users/:id', component: () => ({}) },
      { path: '/posts/:slug', component: () => ({}) },
    ] as const;

    it('provides paths array', () => {
      const builder = createRouteBuilder(routes);
      expect(builder.paths).toEqual(['/home', '/users/:id', '/posts/:slug']);
    });

    it('checks if path exists', () => {
      const builder = createRouteBuilder(routes);
      expect(builder.hasPath('/home')).toBe(true);
      expect(builder.hasPath('/invalid')).toBe(false);
    });

    it('builds link without parameters', () => {
      const builder = createRouteBuilder(routes);
      const link = builder.link('/home', {} as any);
      expect(link).toBe('/home');
    });

    it('builds link with parameters', () => {
      const builder = createRouteBuilder(routes);
      const link = builder.link('/users/:id', { id: '123' } as any);
      expect(link).toBe('/users/123');
    });

    it('builds link with query parameters', () => {
      const builder = createRouteBuilder(routes);
      const link = builder.linkWithQuery('/users/:id', { id: '123' } as any, { page: '1' });
      expect(link).toBe('/users/123?page=1');
    });

    it('throws error when navigate called without router', () => {
      const builder = createRouteBuilder(routes);
      expect(() => builder.navigate('/home', {} as any)).toThrow(
        'Router instance required for navigate()'
      );
    });

    it('navigates with router instance', async () => {
      const mockRouter = { navigate: vi.fn().mockResolvedValue(undefined) };
      const builder = createRouteBuilder(routes, mockRouter as any);

      await builder.navigate('/users/:id', { id: '123' } as any);
      expect(mockRouter.navigate).toHaveBeenCalledWith('/users/123');
    });
  });
});

describe('Async Functions - Critical Paths', () => {
  describe('preloadRoute', () => {
    it('successfully preloads route component', async () => {
      const component = vi.fn().mockResolvedValue({ default: 'Component' });
      const route = { path: '/test', component } as any;

      await preloadRoute(route);
      expect(component).toHaveBeenCalled();
    });

    it('handles component loading errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const component = vi.fn().mockRejectedValue(new Error('Load failed'));
      const route = { path: '/test', component } as any;

      await preloadRoute(route);
      expect(component).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to preload route:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('preloadRoutes', () => {
    it('preloads multiple routes in parallel', async () => {
      const component1 = vi.fn().mockResolvedValue({});
      const component2 = vi.fn().mockResolvedValue({});
      const routes = [
        { path: '/a', component: component1 },
        { path: '/b', component: component2 },
      ] as any;

      await preloadRoutes(routes);
      expect(component1).toHaveBeenCalled();
      expect(component2).toHaveBeenCalled();
    });

    it('handles mixed success and failure', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const component1 = vi.fn().mockResolvedValue({});
      const component2 = vi.fn().mockRejectedValue(new Error('Failed'));
      const routes = [
        { path: '/a', component: component1 },
        { path: '/b', component: component2 },
      ] as any;

      await preloadRoutes(routes);
      expect(component1).toHaveBeenCalled();
      expect(component2).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls when called rapidly', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced();
      debounced();
      debounced();

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments correctly', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced('a', 'b', 'c');
      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(fn).toHaveBeenCalledWith('a', 'b', 'c');
    });
  });
});

describe('Stateful Classes - Critical Paths', () => {
  describe('PerformanceMonitor', () => {
    it('starts navigation tracking', () => {
      const monitor = new PerformanceMonitor();
      const tracker = monitor.startNavigation();

      expect(tracker).toBeDefined();
      expect(tracker.mark).toBeDefined();
      expect(tracker.finish).toBeDefined();
    });

    it('records and stores metrics', () => {
      const monitor = new PerformanceMonitor();
      const metrics = {
        matchTime: 1,
        guardTime: 2,
        loaderTime: 3,
        componentTime: 4,
        totalTime: 10,
      };

      monitor.recordMetrics(metrics);
      const averages = monitor.getAverages();

      expect(averages).toEqual(metrics);
    });

    it('calculates averages across multiple metrics', () => {
      const monitor = new PerformanceMonitor();

      monitor.recordMetrics({
        matchTime: 1,
        guardTime: 2,
        loaderTime: 3,
        componentTime: 4,
        totalTime: 10,
      });

      monitor.recordMetrics({
        matchTime: 3,
        guardTime: 4,
        loaderTime: 5,
        componentTime: 6,
        totalTime: 18,
      });

      const averages = monitor.getAverages();
      expect(averages.matchTime).toBe(2);
      expect(averages.guardTime).toBe(3);
      expect(averages.totalTime).toBe(14);
    });

    it('limits stored metrics to 100 entries', () => {
      const monitor = new PerformanceMonitor();
      const metrics = {
        matchTime: 1,
        guardTime: 1,
        loaderTime: 1,
        componentTime: 1,
        totalTime: 4,
      };

      for (let i = 0; i < 150; i++) {
        monitor.recordMetrics(metrics);
      }

      // Should only keep last 100
      expect(monitor['metrics'].length).toBe(100);
    });

    it('returns zero averages when no metrics recorded', () => {
      const monitor = new PerformanceMonitor();
      const averages = monitor.getAverages();

      expect(averages).toEqual({
        matchTime: 0,
        guardTime: 0,
        loaderTime: 0,
        componentTime: 0,
        totalTime: 0,
      });
    });
  });

  describe('ScrollRestoration', () => {
    beforeEach(() => {
      // Reset mocks
      (window.scrollTo as any).mockClear();
      (window as any).scrollY = 0;
    });

    it('saves scroll position for a path', () => {
      const restoration = new ScrollRestoration();
      (window as any).scrollY = 500;

      restoration.save('/test');
      expect(restoration['scrollPositions'].get('/test')).toBe(500);
    });

    it('restores saved scroll position', () => {
      const restoration = new ScrollRestoration();
      restoration['scrollPositions'].set('/test', 300);

      restoration.restore('/test');
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 300, behavior: 'auto' });
    });

    it('restores to 0 for unsaved paths', () => {
      const restoration = new ScrollRestoration();

      restoration.restore('/unknown');
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    });

    it('clears all scroll positions', () => {
      const restoration = new ScrollRestoration();
      (window as any).scrollY = 100;
      restoration.save('/a');
      (window as any).scrollY = 200;
      restoration.save('/b');

      restoration.clear();
      expect(restoration['scrollPositions'].size).toBe(0);
    });
  });
});
