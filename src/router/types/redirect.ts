/**
 * Redirect functionality for programmatic navigation from loaders/guards
 */

/**
 * Redirect response thrown by loaders to trigger navigation
 * Use the `redirect()` helper function to create these
 */
export class RedirectResponse extends Error {
  constructor(
    public readonly path: string,
    public readonly replace: boolean = false,
  ) {
    super(`Redirect to ${path}`);
    this.name = "RedirectResponse";
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, RedirectResponse.prototype);
  }
}

/**
 * Helper function to trigger a redirect from within a loader or guard
 * Throws a RedirectResponse that the router catches and handles
 *
 * @example
 * loader: async ({ params }) => {
 *   const user = await getUser(params.id)
 *   if (!user) {
 *     return redirect('/404') // Redirect to 404 page
 *   }
 *   return user
 * }
 */
export function redirect(path: string, replace: boolean = false): never {
  throw new RedirectResponse(path, replace);
}
