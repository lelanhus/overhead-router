/**
 * URLPattern API type definitions
 * https://developer.mozilla.org/en-US/docs/Web/API/URLPattern
 */

interface URLPatternInit {
  readonly protocol?: string;
  readonly username?: string;
  readonly password?: string;
  readonly hostname?: string;
  readonly port?: string;
  readonly pathname?: string;
  readonly search?: string;
  readonly hash?: string;
  readonly baseURL?: string;
}

interface URLPatternResult {
  readonly inputs: readonly [URLPatternInit] | readonly [string, string?];
  readonly protocol: URLPatternComponentResult;
  readonly username: URLPatternComponentResult;
  readonly password: URLPatternComponentResult;
  readonly hostname: URLPatternComponentResult;
  readonly port: URLPatternComponentResult;
  readonly pathname: URLPatternComponentResult;
  readonly search: URLPatternComponentResult;
  readonly hash: URLPatternComponentResult;
}

interface URLPatternComponentResult {
  readonly input: string;
  readonly groups: Record<string, string | undefined>;
}

declare class URLPattern {
  constructor(input?: URLPatternInit | string, baseURL?: string);

  test(input?: URLPatternInit | string, baseURL?: string): boolean;
  exec(
    input?: URLPatternInit | string,
    baseURL?: string,
  ): URLPatternResult | null;

  readonly protocol: string;
  readonly username: string;
  readonly password: string;
  readonly hostname: string;
  readonly port: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
}
