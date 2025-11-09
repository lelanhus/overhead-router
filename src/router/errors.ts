/**
 * Error types used internally by the router
 */

/**
 * Tagged error for loader/component failures
 * Allows us to distinguish between loader and component errors
 */
export class TaggedError extends Error {
  constructor(
    public readonly errorType: "loader" | "component",
    public readonly originalError: unknown,
  ) {
    super(
      errorType === "loader"
        ? "Loader failed during navigation"
        : "Component failed during navigation",
    );
    this.name = "TaggedError";
  }
}
