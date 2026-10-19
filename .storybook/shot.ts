/**
 * `parameters.shots`: captures `pnpm shot` adds to a story's default plan (one shot per `FoundationSection`, light and
 * dark). Declare the states the default plan misses: hover, an open popup, a filled form, a motion sequence, mobile.
 * Read by `tooling/shot/plan.ts`; keep it JSON (no functions, no elements).
 *
 * ```ts
 * parameters: {
 *   shots: [
 *     { name: 'hover', target: { section: 'Intent × emphasis' }, scene: [{ hover: 'button >> nth=0' }] },
 *     { name: 'mobile', variant: { device: 'iPhone 15' } },
 *     { name: 'save cycle', scene: [{ fill: '#firstName', text: 'Annika' }], output: { frames: 8, every: 50, slow: 0.1 } },
 *   ] satisfies ReadonlyArray<ShotSpec>,
 * }
 * ```
 */
export interface ShotSpec {
  /** Names the files: `<story>--<name>-<mode>-<hash>.png`. */
  readonly name: string;
  /** Default: the whole page. `section` is a `FoundationSection` or `Preview` title; `select` a Playwright selector. */
  readonly target?:
    | 'page'
    | 'viewport'
    | { readonly section: string }
    | { readonly select: string; readonly within?: string };
  /** Run in order; hover, focus and press belong last. */
  readonly scene?: ReadonlyArray<ShotStep>;
  readonly variant?: {
    readonly mode?: 'light' | 'dark' | 'both' | 'side';
    readonly device?: string;
    readonly globals?: Readonly<Record<string, string>>;
    readonly scale?: number;
    readonly reducedMotion?: boolean;
  };
  /** Default: a still. */
  readonly output?:
    | { readonly overlay?: ReadonlyArray<'boxes' | 'gaps' | 'edges' | 'type' | 'grid'>; readonly loupe?: number }
    | { readonly frames: number; readonly every: number; readonly slow?: number }
    | 'aria';
}

export type ShotStep =
  | { readonly click: string }
  | { readonly hover: string }
  | { readonly focus: string }
  | { readonly press: string }
  | { readonly fill: string; readonly text: string }
  | { readonly key: string };
