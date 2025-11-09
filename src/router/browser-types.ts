/**
 * TypeScript types for browser APIs (View Transitions, Navigation API)
 * These are not in @types/dom yet, so we define them here
 */

/**
 * TypeScript type for View Transitions API
 * Used for type-safe access to document.startViewTransition
 */
export type ViewTransitionCallback = () => void | Promise<void>;
export type DocumentWithViewTransitions = Document & {
  readonly startViewTransition: (callback: ViewTransitionCallback) => {
    readonly finished: Promise<void>;
    readonly ready: Promise<void>;
    readonly updateCallbackDone: Promise<void>;
    skipTransition(): void;
  };
};

/**
 * TypeScript types for Navigation API
 * Chrome 102+, Edge 102+, Opera 88+ only
 */
export interface NavigationNavigateOptions {
  readonly state?: unknown;
  readonly history?: "auto" | "push" | "replace";
  readonly info?: unknown;
}

export interface NavigationResult {
  readonly committed: Promise<NavigationHistoryEntry>;
  readonly finished: Promise<NavigationHistoryEntry>;
}

export interface NavigationHistoryEntry {
  readonly id: string;
  readonly key: string;
  readonly url: string | null;
  readonly index: number;
  readonly sameDocument: boolean;
  getState(): unknown;
}

export interface NavigationAPI {
  navigate(url: string, options?: NavigationNavigateOptions): NavigationResult;
  reload(options?: {
    readonly state?: unknown;
    readonly info?: unknown;
  }): NavigationResult;
  back(options?: { readonly info?: unknown }): NavigationResult;
  forward(options?: { readonly info?: unknown }): NavigationResult;
  traverseTo(
    key: string,
    options?: { readonly info?: unknown },
  ): NavigationResult | undefined;
  readonly currentEntry: NavigationHistoryEntry | null;
  entries(): readonly NavigationHistoryEntry[];
  updateCurrentEntry(options: { readonly state: unknown }): void;
  addEventListener(
    type: "navigate",
    listener: (event: NavigateEvent) => void,
  ): void;
  removeEventListener(
    type: "navigate",
    listener: (event: NavigateEvent) => void,
  ): void;
}

export interface NavigateEvent extends Event {
  readonly canIntercept: boolean;
  readonly destination: {
    readonly url: string;
    readonly key: string | null;
    readonly id: string | null;
    readonly index: number;
    readonly sameDocument: boolean;
    getState(): unknown;
  };
  readonly downloadRequest: string | null;
  readonly formData: FormData | null;
  readonly hashChange: boolean;
  readonly info: unknown;
  readonly navigationType: "reload" | "push" | "replace" | "traverse";
  readonly signal: AbortSignal;
  readonly userInitiated: boolean;
  intercept(options?: { readonly handler?: () => Promise<void> }): void;
}

export type WindowWithNavigation = Window & {
  readonly navigation: NavigationAPI;
};
