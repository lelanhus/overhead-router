/**
 * Scroll restoration for maintaining scroll positions across navigations
 */

/**
 * Declarative scroll restoration
 */
export class ScrollRestoration {
  private readonly scrollPositions = new Map<string, number>();

  /**
   * Save the current scroll position for a given path
   * @param path - The path to associate with the current scroll position
   */
  save(path: string): void {
    this.scrollPositions.set(path, window.scrollY);
  }

  /**
   * Restore the saved scroll position for a given path
   * Scrolls to top if no position was previously saved
   * @param path - The path to restore scroll position for
   */
  restore(path: string): void {
    const position = this.scrollPositions.get(path) ?? 0;
    window.scrollTo({ top: position, behavior: "auto" });
  }

  /**
   * Clear all saved scroll positions
   */
  clear(): void {
    this.scrollPositions.clear();
  }
}
