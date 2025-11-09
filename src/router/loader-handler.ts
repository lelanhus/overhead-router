/**
 * Route data loading and component loading
 */

import type { RouteMatch, LoaderContext } from "../router.types.js";
import { RedirectResponse } from "../router.types.js";
import { TaggedError } from "./errors.js";
import type { NavigationConfig } from "./navigation.js";

/**
 * Load data with loader and component in parallel
 */
async function loadWithLoader(
  match: RouteMatch,
  loaderContext: LoaderContext,
): Promise<unknown> {
  // Caller ensures loader exists
  const loader = match.route.loader;
  if (loader === undefined) {
    throw new Error("Loader is required");
  }

  const [loaderResult, componentResult] = await Promise.allSettled([
    loader(loaderContext),
    match.route.component(),
  ]);

  if (loaderResult.status === "rejected") {
    if (loaderResult.reason instanceof RedirectResponse) {
      throw loaderResult.reason;
    }
    throw new TaggedError("loader", loaderResult.reason);
  }

  if (componentResult.status === "rejected") {
    if (componentResult.reason instanceof RedirectResponse) {
      throw componentResult.reason;
    }
    throw new TaggedError("component", componentResult.reason);
  }

  return loaderResult.value;
}

/**
 * Load component only (no loader)
 */
async function loadComponentOnly(
  match: RouteMatch,
  config: NavigationConfig,
): Promise<null> {
  try {
    await match.route.component();
    return null;
  } catch (error) {
    config.onError({
      type: "component-error",
      error: error as Error,
      route: match.route,
    });
    throw error;
  }
}

/**
 * Handle tagged errors from loader/component
 */
function handleTaggedLoadError(
  error: TaggedError,
  route: RouteMatch["route"],
  config: NavigationConfig,
): void {
  if (error.errorType === "loader") {
    config.onError({
      type: "loader-error",
      error: error.originalError as Error,
      route,
    });
  } else {
    config.onError({
      type: "component-error",
      error: error.originalError as Error,
      route,
    });
  }
}

/**
 * Load route data and component
 * Performance: Loads in parallel when both exist
 */
export async function loadRouteData(
  match: RouteMatch,
  controller: AbortController,
  config: NavigationConfig,
  guardContext: unknown,
): Promise<unknown> {
  try {
    if (match.route.loader !== undefined) {
      const loaderContext: LoaderContext = {
        params: match.params,
        query: match.query,
        hash: match.hash,
        signal: controller.signal,
        context: guardContext,
      };
      return await loadWithLoader(match, loaderContext);
    }
    return await loadComponentOnly(match, config);
  } catch (error) {
    if (error instanceof TaggedError) {
      handleTaggedLoadError(error, match.route, config);
    }
    throw error;
  }
}
