/**
 * Performance utilities including debouncing and navigation metrics tracking
 */

/**
 * Debounce a function to prevent excessive calls during rapid events
 *
 * Delays function execution until after a specified time has passed since the
 * last call. Useful for expensive operations triggered by scroll, resize, or
 * input events. Each new call resets the delay timer.
 *
 * @param fn - Function to debounce
 * @param ms - Delay in milliseconds before executing function
 * @returns Debounced version of the function
 *
 * @example
 * // Debounce scroll handler
 * const handleScroll = debounce(() => {
 *   console.log('Scrolled!', window.scrollY);
 * }, 150);
 * window.addEventListener('scroll', handleScroll);
 *
 * @example
 * // Debounce search input
 * const search = debounce((query: string) => {
 *   fetchResults(query);
 * }, 300);
 * input.addEventListener('input', (e) => search(e.target.value));
 */
export function debounce<T extends (...args: readonly unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  // eslint-disable-next-line functional/no-let
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

/**
 * Performance: Measure route navigation time
 */
export interface PerformanceMetrics {
  readonly matchTime: number;
  readonly guardTime: number;
  readonly loaderTime: number;
  readonly componentTime: number;
  readonly totalTime: number;
}

export class PerformanceMonitor {
  // State container for metrics rolling window - reassigned to create new immutable arrays
  // ESLint can't distinguish reassignment from mutation - we create new containers, never mutate
  // eslint-disable-next-line functional/prefer-readonly-type
  private metrics: { readonly value: readonly PerformanceMetrics[] } = {
    value: [],
  };

  /**
   * Start tracking performance metrics for a navigation
   * @returns A PerformanceTracker instance to mark navigation milestones
   */
  startNavigation(): PerformanceTracker {
    return new PerformanceTracker();
  }

  /**
   * Record performance metrics for a completed navigation
   * Maintains a rolling window of the last 100 navigations
   * @param metrics - The performance metrics to record
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    // Keep last 100 navigations only - use immutable pattern
    this.metrics = { value: [...this.metrics.value, metrics].slice(-100) };
  }

  /**
   * Calculate average performance metrics across all recorded navigations
   * @returns Averaged metrics for match, guard, loader, component, and total time
   */
  getAverages(): PerformanceMetrics {
    const count = this.metrics.value.length;
    if (count === 0) {
      return {
        matchTime: 0,
        guardTime: 0,
        loaderTime: 0,
        componentTime: 0,
        totalTime: 0,
      };
    }

    return {
      matchTime:
        this.metrics.value.reduce((sum, m) => sum + m.matchTime, 0) / count,
      guardTime:
        this.metrics.value.reduce((sum, m) => sum + m.guardTime, 0) / count,
      loaderTime:
        this.metrics.value.reduce((sum, m) => sum + m.loaderTime, 0) / count,
      componentTime:
        this.metrics.value.reduce((sum, m) => sum + m.componentTime, 0) / count,
      totalTime:
        this.metrics.value.reduce((sum, m) => sum + m.totalTime, 0) / count,
    };
  }
}

class PerformanceTracker {
  private readonly startTime = performance.now();
  private readonly marks: Record<string, number> = {};

  mark(label: string): void {
    this.marks[label] = performance.now();
  }

  finish(): PerformanceMetrics {
    const endTime = performance.now();

    return {
      matchTime:
        this.marks["matchEnd"] !== undefined
          ? this.marks["matchEnd"] - this.startTime
          : 0,
      guardTime:
        this.marks["guardEnd"] !== undefined
          ? this.marks["guardEnd"] - (this.marks["matchEnd"] ?? this.startTime)
          : 0,
      loaderTime:
        this.marks["loaderEnd"] !== undefined
          ? this.marks["loaderEnd"] - (this.marks["guardEnd"] ?? this.startTime)
          : 0,
      componentTime:
        this.marks["componentEnd"] !== undefined
          ? this.marks["componentEnd"] -
            (this.marks["loaderEnd"] ?? this.startTime)
          : 0,
      totalTime: endTime - this.startTime,
    };
  }
}
