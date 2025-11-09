/**
 * Route guard evaluation and handling
 */

import type { RouteMatch } from "../router.types.js";
import type { NavigationConfig } from "./navigation.js";

/**
 * Guard result types
 */
export type GuardCheckResult =
  | { readonly type: "allowed"; readonly context: unknown }
  | { readonly type: "denied" }
  | {
      readonly type: "redirect";
      readonly path: string;
      readonly replace?: boolean;
    };

/**
 * Handle boolean guard result
 */
async function handleBooleanGuardResult(
  allowed: boolean,
  path: string,
  route: RouteMatch["route"],
  config: NavigationConfig,
): Promise<GuardCheckResult> {
  if (!allowed) {
    config.onError({
      type: "guard-failed",
      path,
      route,
    });
    await config.unauthorized();
    return { type: "denied" };
  }
  return { type: "allowed", context: undefined };
}

/**
 * Handle object guard result
 */
function handleObjectGuardResult(
  guardResult: Record<string, unknown>,
): GuardCheckResult {
  if ("redirect" in guardResult) {
    const redirectPath = guardResult["redirect"];
    // Runtime validation: redirect must be a string
    if (typeof redirectPath !== "string") {
      throw new TypeError(
        `Guard redirect must be a string, got ${typeof redirectPath}`,
      );
    }
    const result: GuardCheckResult = {
      type: "redirect",
      path: redirectPath,
    };
    const replaceValue = guardResult["replace"];
    if (replaceValue !== undefined) {
      // Runtime validation: replace must be a boolean
      if (typeof replaceValue !== "boolean") {
        throw new TypeError(
          `Guard replace must be a boolean, got ${typeof replaceValue}`,
        );
      }
      return { ...result, replace: replaceValue };
    }
    return result;
  }

  if ("deny" in guardResult && guardResult["deny"] === true) {
    return { type: "denied" };
  }

  if ("allow" in guardResult && guardResult["allow"] === true) {
    return { type: "allowed", context: guardResult["context"] };
  }

  return { type: "allowed", context: undefined };
}

/**
 * Run route guard and return result
 */
export async function runGuard(
  match: RouteMatch,
  path: string,
  config: NavigationConfig,
): Promise<GuardCheckResult> {
  if (match.route.guard === undefined) {
    return { type: "allowed", context: undefined };
  }

  const guardResult = await match.route.guard(match.params);

  if (typeof guardResult === "boolean") {
    return handleBooleanGuardResult(guardResult, path, match.route, config);
  }

  if (typeof guardResult === "object") {
    const result = handleObjectGuardResult(guardResult);
    if (result.type === "denied") {
      config.onError({ type: "unauthorized", path, route: match.route });
      await config.unauthorized();
    }
    return result;
  }

  return { type: "allowed", context: undefined };
}
