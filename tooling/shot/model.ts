import { createHash } from 'node:crypto';

/**
 * What one shot is. Every command builds a `Plan` (captures), runs it and reports a `Result` per capture; naming,
 * grouping, matrices, interaction and output kinds all follow from these fields.
 */

type StoryId = string;

export type Mode = 'light' | 'dark' | 'side';

export interface Variant {
  readonly mode: Mode;
  /** Storybook globals: surface, primaryColor, baseColor, destructiveColor, … */
  readonly globals: Readonly<Record<string, string>>;
  /** Playwright device name; undefined = desktop. */
  readonly device: string | undefined;
  /** Viewport override; undefined = the device's, or 1280×900. */
  readonly width: number | undefined;
  readonly height: number | undefined;
  readonly scale: number;
  readonly reducedMotion: boolean;
}

export type Step =
  | { readonly kind: 'click' | 'hover' | 'focus' | 'press'; readonly selector: string }
  | { readonly kind: 'fill'; readonly selector: string; readonly text: string }
  | { readonly kind: 'key'; readonly key: string };

export type Target =
  | { readonly kind: 'page' | 'viewport' }
  /** `nth`: which of several sections with this title (0-based); undefined = the title must be unique. */
  | { readonly kind: 'section'; readonly title: string; readonly nth?: number | undefined }
  /** `within`: a section title the selector is scoped to. */
  | { readonly kind: 'select'; readonly selector: string; readonly within: string | undefined };

/** `Sizes` or `Sizes >> nth=1`, for a title that appears more than once. */
export const sectionTarget = (title: string): Extract<Target, { kind: 'section' }> => {
  const match = /^(.*?)\s*>>\s*nth=(\d+)$/.exec(title);
  return match === null ? { kind: 'section', title } : { kind: 'section', title: match[1]!, nth: Number(match[2]) };
};

export const OVERLAYS = ['boxes', 'gaps', 'edges', 'type', 'grid'] as const;
export type Overlay = (typeof OVERLAYS)[number];

export type Output =
  | { readonly kind: 'still'; readonly overlays: ReadonlyArray<Overlay>; readonly loupe: number | undefined }
  | { readonly kind: 'frames'; readonly count: number; readonly everyMs: number; readonly slow: number }
  | { readonly kind: 'measure'; readonly styles: ReadonlyArray<string>; readonly all: boolean }
  | { readonly kind: 'aria' };

/** Where a capture renders: a Storybook story, or a route of the running app as a user in an organization. */
export type Source =
  | { readonly kind: 'story'; readonly id: StoryId }
  | {
      readonly kind: 'route';
      /** Concrete path with query, no `:params`: `/app/persons/abc?tab=contacts`. */
      readonly path: string;
      /** The user's email. */
      readonly as: string;
      /** Organization slug or id; undefined = the server's default for the user. */
      readonly org: string | undefined;
    };

export interface Capture {
  readonly source: Source;
  /** A label from `--name` or `parameters.shots`; replaces the generated slug. */
  readonly name: string | undefined;
  readonly variant: Variant;
  readonly scene: ReadonlyArray<Step>;
  readonly target: Target;
  readonly output: Output;
}

export type Plan = ReadonlyArray<Capture>;

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

const CHECKS = ['render', 'console', 'a11y', 'focus', 'overflow', 'target', 'tokens', 'align'] as const;
export type CheckId = (typeof CHECKS)[number];

export interface Finding {
  readonly check: CheckId;
  readonly severity: 'error' | 'warn';
  readonly message: string;
  readonly selector: string;
  readonly rect: Rect | undefined;
  /** Also found at the baseline: reported, never fails `verify`. */
  readonly known?: boolean;
}

export type Diff =
  | { readonly kind: 'new' | 'same' }
  | { readonly kind: 'changed'; readonly regions: ReadonlyArray<Rect>; readonly pixels: number }
  | { readonly kind: 'resized'; readonly from: Size; readonly to: Size };

export interface Result {
  readonly capture: Capture;
  readonly key: string;
  /** PNG for still and frames; JSON for measure; text for aria. Undefined when the render failed. */
  readonly file: string | undefined;
  /** Overlay, measure or frame data; also written next to the file as `<key>.json`. */
  readonly measurements: unknown;
  readonly findings: ReadonlyArray<Finding>;
  readonly diff: Diff | undefined;
}

export const DEFAULT_VARIANT: Variant = {
  mode: 'light',
  globals: {},
  device: undefined,
  width: undefined,
  height: undefined,
  scale: 1,
  reducedMotion: false,
};

/** JSON with sorted keys and no undefined fields: equal captures give equal strings. */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, field: unknown) =>
    field !== null && typeof field === 'object' && !Array.isArray(field)
      ? Object.fromEntries(
          Object.entries(field)
            .filter(([, entry]) => entry !== undefined)
            .sort(([a], [b]) => a.localeCompare(b)),
        )
      : field,
  );

export const hash = (value: string, length = 6): string =>
  createHash('sha256').update(value).digest('hex').slice(0, length);

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 40);

const targetSlug = (target: Target): string | undefined => {
  switch (target.kind) {
    case 'page':
      return undefined;
    case 'viewport':
      return 'viewport';
    case 'section':
      return target.nth === undefined ? slugify(target.title) : `${slugify(target.title)}-${target.nth + 1}`;
    case 'select':
      return [target.within === undefined ? undefined : slugify(target.within), 'select']
        .filter((value) => Boolean(value))
        .join('-');
  }
};

const outputSlug = (output: Output): ReadonlyArray<string> => {
  switch (output.kind) {
    case 'still':
      return [...output.overlays, ...(output.loupe === undefined ? [] : [`loupe${output.loupe}`])];
    case 'frames':
      return ['frames'];
    case 'measure':
      return ['measure'];
    case 'aria':
      return ['aria'];
  }
};

/** The first part of a key: the story id, or `route-<path>`. */
export const sourceId = (source: Source): string =>
  source.kind === 'story' ? source.id : ['route', slugify(source.path)].filter((part) => part !== '').join('-');

/** For people: the story id, or `/path as user in org`. */
export const describeSource = (source: Source): string =>
  source.kind === 'story'
    ? source.id
    : `${source.path} as ${source.as}${source.org === undefined ? '' : ` in ${source.org}`}`;

/** Readable part of the key: name or target, steps, user and organization, device, non-default globals, output, mode. */
export const slug = (capture: Capture): string =>
  [
    capture.name === undefined ? targetSlug(capture.target) : slugify(capture.name),
    ...(capture.name === undefined ? capture.scene.map((step) => step.kind) : []),
    capture.source.kind === 'route' ? slugify(capture.source.as.split('@')[0]!) : undefined,
    capture.source.kind === 'route' && capture.source.org !== undefined ? slugify(capture.source.org) : undefined,
    capture.variant.device === undefined ? undefined : slugify(capture.variant.device),
    ...Object.values(capture.variant.globals).map((value) => slugify(value)),
    ...outputSlug(capture.output),
    capture.variant.mode,
  ]
    .filter((part) => part !== undefined && part !== '')
    .join('-');

/** What the hash covers. A story capture keeps the shape it had before routes, so story keys stay stable. */
const identity = (capture: Capture): unknown => {
  const { source, ...rest } = capture;
  return source.kind === 'story' ? { ...rest, story: source.id } : capture;
};

/** `<source>--<slug>-<hash6>`: the same capture always gets the same key, different captures never share one. */
export const key = (capture: Capture): string =>
  `${sourceId(capture.source)}--${slug(capture)}-${hash(canonical(identity(capture)))}`;

export const extension = (output: Output): string => {
  switch (output.kind) {
    case 'still':
    case 'frames':
      return 'png';
    case 'measure':
      return 'json';
    case 'aria':
      return 'txt';
  }
};

/** Captures that share a page load: same source, variant and scene. Frames need their own load: they start unsettled. */
export const groupKey = (capture: Capture): string =>
  canonical({
    source: capture.source,
    variant: capture.variant,
    scene: capture.scene,
    frames: capture.output.kind === 'frames' ? capture : undefined,
  });

export const describeTarget = (target: Target): string => {
  switch (target.kind) {
    case 'page':
      return 'page';
    case 'viewport':
      return 'viewport';
    case 'section':
      return target.nth === undefined ? target.title : `${target.title} >> nth=${target.nth}`;
    case 'select':
      return target.within === undefined ? target.selector : `${target.within} › ${target.selector}`;
  }
};
