import {
  type Capture,
  DEFAULT_VARIANT,
  type Mode,
  type Output,
  OVERLAYS,
  type Overlay,
  type Plan,
  sectionTarget,
  type Step,
  type Target,
  type Variant,
} from './model.ts';
import { fail } from './output.ts';

/** Plans: from CLI flags, from a story's default plan plus its `parameters.shots`, and their union for `verify`. */

export interface Flags {
  readonly modes: ReadonlyArray<Mode>;
  /** Already crossed: one record per combination of the comma lists. */
  readonly globals: ReadonlyArray<Readonly<Record<string, string>>>;
  readonly device: string | undefined;
  readonly width: number | undefined;
  readonly height: number | undefined;
  readonly scale: number | undefined;
  readonly reducedMotion: boolean;
  readonly steps: ReadonlyArray<Step>;
  readonly sections: ReadonlyArray<string>;
  readonly selects: ReadonlyArray<string>;
  readonly viewport: boolean;
  readonly overlays: ReadonlyArray<Overlay>;
  readonly loupe: number | undefined;
  readonly frames: { readonly count: number; readonly everyMs: number; readonly slow: number } | undefined;
  readonly measure: { readonly styles: ReadonlyArray<string>; readonly all: boolean } | undefined;
  readonly aria: boolean;
  readonly name: string | undefined;
}

export const DEFAULT_FLAGS: Flags = {
  modes: ['light', 'dark'],
  globals: [{}],
  device: undefined,
  width: undefined,
  height: undefined,
  scale: undefined,
  reducedMotion: false,
  steps: [],
  sections: [],
  selects: [],
  viewport: false,
  overlays: [],
  loupe: undefined,
  frames: undefined,
  measure: undefined,
  aria: false,
  name: undefined,
};

export const modesFor = (mode: string): ReadonlyArray<Mode> =>
  mode.split(',').flatMap((part): ReadonlyArray<Mode> => {
    switch (part.trim()) {
      case 'light':
      case 'dark':
      case 'side':
        return [part.trim() as Mode];
      case 'both':
        return ['light', 'dark'];
      default:
        return fail(`--mode takes light, dark, both or side (comma-separated), got "${part}".`);
    }
  });

/** True when the flags pick targets, a scene or an output: then they are the plan, not the story's. */
export const isExplicit = (flags: Flags): boolean =>
  flags.steps.length > 0 ||
  flags.sections.length > 0 ||
  flags.selects.length > 0 ||
  flags.viewport ||
  flags.overlays.length > 0 ||
  flags.loupe !== undefined ||
  flags.frames !== undefined ||
  flags.measure !== undefined ||
  flags.aria;

const variants = (flags: Flags, modes: ReadonlyArray<Mode> = flags.modes): ReadonlyArray<Variant> =>
  modes.flatMap((mode) =>
    flags.globals.map((globals) => ({
      ...DEFAULT_VARIANT,
      mode,
      globals,
      device: flags.device,
      width: flags.width,
      height: flags.height,
      scale: flags.scale ?? (flags.device === undefined ? 1 : 2),
      reducedMotion: flags.reducedMotion,
    })),
  );

const outputFrom = (flags: Flags): Output => {
  const kinds = [flags.frames, flags.measure, flags.aria ? true : undefined].filter((kind) => kind !== undefined);
  if (kinds.length > 1) fail('--frames, --measure and --aria are separate outputs: pick one per run.');
  if (kinds.length > 0 && (flags.overlays.length > 0 || flags.loupe !== undefined)) {
    fail('--overlay and --loupe apply to stills, not to --frames, --measure or --aria.');
  }
  if (flags.frames !== undefined) return { kind: 'frames', ...flags.frames };
  if (flags.measure !== undefined) return { kind: 'measure', ...flags.measure };
  if (flags.aria) return { kind: 'aria' };
  return { kind: 'still', overlays: flags.overlays, loupe: flags.loupe };
};

const targetsFrom = (flags: Flags): ReadonlyArray<Target> => {
  if (flags.selects.length > 0) {
    const scopes = flags.sections.length > 0 ? flags.sections : [undefined];
    return flags.selects.flatMap((selector) => scopes.map((within): Target => ({ kind: 'select', selector, within })));
  }
  if (flags.sections.length > 0) return flags.sections.map((value) => sectionTarget(value));
  return [{ kind: flags.viewport ? 'viewport' : 'page' }];
};

/** Hover, focus and press hold a state the shot shows: they run after the other steps. */
const ordered = (steps: ReadonlyArray<Step>): ReadonlyArray<Step> => [
  ...steps.filter((step) => step.kind === 'click' || step.kind === 'fill' || step.kind === 'key'),
  ...steps.filter((step) => step.kind === 'hover' || step.kind === 'focus' || step.kind === 'press'),
];

const cross = (
  story: string,
  name: string | undefined,
  variantList: ReadonlyArray<Variant>,
  scene: ReadonlyArray<Step>,
  targets: ReadonlyArray<Target>,
  output: Output,
): Plan =>
  variantList.flatMap((variant) =>
    targets.map((target): Capture => ({ story, name, variant, scene: ordered(scene), target, output })),
  );

export const planFromFlags = (story: string, flags: Flags): Plan =>
  cross(story, flags.name, variants(flags), flags.steps, targetsFrom(flags), outputFrom(flags));

/** One still per `FoundationSection`, or the page when the story has none. */
export const defaultPlan = (story: string, flags: Flags, sections: ReadonlyArray<string>): Plan =>
  cross(
    story,
    undefined,
    variants(flags),
    [],
    sections.length > 0
      ? sections.map((title, index): Target => {
          const repeats = sections.filter((other) => other === title).length;
          const nth = sections.slice(0, index).filter((other) => other === title).length;
          return { kind: 'section', title, nth: repeats > 1 ? nth : undefined };
        })
      : [{ kind: 'page' }],
    { kind: 'still', overlays: [], loupe: undefined },
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const string = (value: unknown, where: string): string =>
  typeof value === 'string' && value !== '' ? value : fail(`${where} must be a non-empty string.`);

const stepFromSpec = (value: unknown, where: string): Step => {
  if (!isRecord(value)) return fail(`${where} must be an object like { click: '<selector>' }.`);
  if ('fill' in value)
    return { kind: 'fill', selector: string(value['fill'], `${where}.fill`), text: String(value['text'] ?? '') };
  if ('key' in value) return { kind: 'key', key: string(value['key'], `${where}.key`) };
  for (const kind of ['click', 'hover', 'focus', 'press'] as const) {
    if (kind in value) return { kind, selector: string(value[kind], `${where}.${kind}`) };
  }
  return fail(`${where} needs one of click, hover, focus, press, fill, key.`);
};

const targetFromSpec = (value: unknown, where: string): Target => {
  if (value === undefined || value === 'page') return { kind: 'page' };
  if (value === 'viewport') return { kind: 'viewport' };
  if (isRecord(value) && 'section' in value)
    return { kind: 'section', title: string(value['section'], `${where}.section`) };
  if (isRecord(value) && 'select' in value) {
    return {
      kind: 'select',
      selector: string(value['select'], `${where}.select`),
      within: value['within'] === undefined ? undefined : string(value['within'], `${where}.within`),
    };
  }
  return fail(`${where} must be 'page', 'viewport', { section } or { select, within? }.`);
};

const outputFromSpec = (value: unknown, where: string): Output => {
  if (value === undefined) return { kind: 'still', overlays: [], loupe: undefined };
  if (value === 'aria') return { kind: 'aria' };
  if (isRecord(value) && 'frames' in value) {
    return {
      kind: 'frames',
      count: Number(value['frames']),
      everyMs: Number(value['every'] ?? 50),
      slow: Number(value['slow'] ?? 1),
    };
  }
  if (isRecord(value)) {
    const overlays = Array.isArray(value['overlay']) ? value['overlay'] : [];
    for (const overlay of overlays) {
      if (!OVERLAYS.includes(overlay as Overlay)) fail(`${where}.overlay: unknown overlay "${String(overlay)}".`);
    }
    return {
      kind: 'still',
      overlays: overlays as ReadonlyArray<Overlay>,
      loupe: value['loupe'] === undefined ? undefined : Number(value['loupe']),
    };
  }
  return fail(`${where} must be { overlay?, loupe? }, { frames, every, slow? } or 'aria'.`);
};

/** Captures from `parameters.shots`; flags supply what a spec leaves out (modes, device, globals). */
export const declaredPlan = (story: string, flags: Flags, shots: unknown): Plan => {
  if (shots === undefined) return [];
  if (!Array.isArray(shots)) return fail(`${story}: parameters.shots must be an array of ShotSpec.`);
  return shots.flatMap((spec: unknown, index) => {
    const where = `${story} parameters.shots[${index}]`;
    if (!isRecord(spec)) return fail(`${where} must be an object.`);
    const variant = isRecord(spec['variant']) ? spec['variant'] : {};
    const specFlags: Flags = {
      ...flags,
      modes: typeof variant['mode'] === 'string' ? modesFor(variant['mode']) : flags.modes,
      device: typeof variant['device'] === 'string' ? variant['device'] : flags.device,
      globals: flags.globals.map(
        (globals) =>
          ({ ...globals, ...(isRecord(variant['globals']) ? variant['globals'] : {}) }) as Record<string, string>,
      ),
      scale: typeof variant['scale'] === 'number' ? variant['scale'] : flags.scale,
      reducedMotion: typeof variant['reducedMotion'] === 'boolean' ? variant['reducedMotion'] : flags.reducedMotion,
    };
    const scene = Array.isArray(spec['scene'])
      ? spec['scene'].map((step: unknown, stepIndex) => stepFromSpec(step, `${where}.scene[${stepIndex}]`))
      : [];
    return cross(
      story,
      string(spec['name'], `${where}.name`),
      variants(specFlags),
      scene,
      [targetFromSpec(spec['target'], `${where}.target`)],
      outputFromSpec(spec['output'], `${where}.output`),
    );
  });
};
