import { DEFAULT_SIZING, type SizingToken, type SizingValues } from '~/lib/theme/sizing';

/**
 * The tunable scales and their defaults, as in `tailwind.css`. Shared by the foundation pages and the
 * docs customize panel (`site/customize.tsx`); it imports only the sizing tokens (`lib/theme/sizing.ts`).
 */

export const SPACING_STEPS = [
  { name: 'tight', px: 4 },
  { name: 'related', px: 8 },
  { name: 'part', px: 12 },
  { name: 'group', px: 16 },
  { name: 'card', px: 20 },
  { name: 'page', px: 32 },
  { name: 'section', px: 48 },
] as const;

export type SpacingStep = (typeof SPACING_STEPS)[number];
export type SpacingStepName = SpacingStep['name'];

/** Tracking and weight are fixed per role; size and line height (px) are tunable. */
export const TYPE_ROLES = [
  { name: 'title', px: 28, lineHeight: 36, tracking: '−0.02em', weight: 500 },
  { name: 'heading', px: 18, lineHeight: 24, tracking: '−0.01em', weight: 500 },
  { name: 'body', px: 14, lineHeight: 21, tracking: undefined, weight: 400 },
  { name: 'control', px: 14, lineHeight: 20, tracking: undefined, weight: 400 },
  { name: 'label', px: 14, lineHeight: 16, tracking: undefined, weight: 500 },
  { name: 'caption', px: 12, lineHeight: 16, tracking: undefined, weight: 400 },
] as const;

export type TypeRole = (typeof TYPE_ROLES)[number];

/** One CSS variable Customize tunes. `global` is the variable without `--`. */
export interface TunableToken {
  readonly global: string;
  readonly label: string;
  readonly defaultValue: number;
  readonly unit: 'px' | 'rem' | '';
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** A value past `max` that the slider's last stop stands for: `9999` px, a full round. */
  readonly full?: number;
}

export interface TokenGroup {
  readonly title: string;
  readonly tokens: ReadonlyArray<TunableToken>;
}

export const spacingToken = (step: SpacingStep): TunableToken => ({
  global: `spacing-${step.name}`,
  label: step.name,
  defaultValue: step.px,
  unit: 'px',
  min: 0,
  max: 96,
  step: 1,
});

export const typeSizeToken = (role: TypeRole): TunableToken => ({
  global: `text-${role.name}`,
  label: `${role.name} size`,
  defaultValue: role.px,
  unit: 'px',
  min: 8,
  max: 64,
  step: 1,
});

export const typeLineHeightToken = (role: TypeRole): TunableToken => ({
  global: `text-${role.name}--line-height`,
  label: `${role.name} leading`,
  defaultValue: role.lineHeight,
  unit: 'px',
  min: 8,
  max: 80,
  step: 1,
});

/** The radius roles (`rounded-control`, `rounded-card`, …). The fixed steps (`rounded-sm` … `rounded-5xl`) do not tune. */
export const RADIUS_ROLES = [
  { name: 'control-xs', px: 4, use: 'Controls 16–20px: Kbd' },
  { name: 'control-sm', px: 8, use: 'Controls 20–28px, badges' },
  { name: 'control', px: 10, use: 'Controls 32–36px, fields' },
  { name: 'control-lg', px: 12, use: 'Controls 40px' },
  { name: 'popup', px: 16, use: 'Menus, popovers, selects' },
  { name: 'card', px: 20, use: 'Card shell, Alert' },
  { name: 'dialog', px: 20, use: 'Dialogs, sheets' },
  { name: 'panel', px: 20, use: 'The page panel' },
  { name: 'checkbox', px: 4, use: 'Checkbox: never a pill' },
  { name: 'tooltip', px: 8, use: 'Tooltips, chart tooltip' },
  { name: 'area', px: 10, use: 'Multi-line fields: Textarea, drop zone' },
  { name: 'block', px: 12, use: 'Rows and blocks: Item, choice card' },
  { name: 'track', px: 9999, use: 'Switch, slider, progress' },
] as const;

export type RadiusRole = (typeof RADIUS_ROLES)[number];

const FULL = 9999;

export const radiusToken = (role: RadiusRole): TunableToken => ({
  global: `radius-${role.name}`,
  label: role.name,
  defaultValue: role.px,
  unit: 'px',
  min: 0,
  max: 32,
  step: 1,
  full: FULL,
});

/**
 * The shared sizing scale (control and row heights, paddings, gaps, icons, insets), from `lib/theme/sizing.ts`: every
 * `--spacing-*` token that is not a spacing step.
 */
export const SIZING_SCALE_TOKENS: ReadonlyArray<TunableToken> = Object.entries(DEFAULT_SIZING)
  .filter(([name]) => name.startsWith('--spacing-') && !SPACING_STEPS.some((step) => name === `--spacing-${step.name}`))
  .map(([name, value]) => ({
    global: name.slice(2),
    label: name.slice('--spacing-'.length).replaceAll('-', ' '),
    defaultValue: Number.parseFloat(value),
    unit: 'px',
    min: 0,
    max: 64,
    step: 1,
  }));

export const TOKEN_GROUPS: ReadonlyArray<TokenGroup> = [
  { title: 'Spacing', tokens: SPACING_STEPS.map((step) => spacingToken(step)) },
  { title: 'Type', tokens: TYPE_ROLES.flatMap((role) => [typeSizeToken(role), typeLineHeightToken(role)]) },
  { title: 'Sizing', tokens: SIZING_SCALE_TOKENS },
  { title: 'Radius', tokens: RADIUS_ROLES.map((role) => radiusToken(role)) },
];

const TUNABLE_TOKENS = TOKEN_GROUPS.flatMap((group) => group.tokens);

export const DEFAULT_TOKEN_GLOBALS: Record<string, number> = Object.fromEntries(
  TUNABLE_TOKENS.map((token) => [token.global, token.defaultValue]),
);

/** A token's tuned value from the globals; anything that is not a number in range (or `full`) falls back to the default. */
export const tokenValue = (globals: Record<string, unknown>, token: TunableToken): number => {
  const value = Number(globals[token.global]);
  const valid = Number.isFinite(value) && ((value >= token.min && value <= token.max) || value === token.full);
  return valid ? value : token.defaultValue;
};

export const spacingValue = (globals: Record<string, unknown>, step: SpacingStep): number =>
  tokenValue(globals, spacingToken(step));

/**
 * The tunable tokens a sizing theme's values set, as globals (`{ 'spacing-control': 32 }`): what the panel and the
 * foundation pages show under that theme.
 */
export const sizingGlobals = (values: SizingValues): Record<string, number> =>
  Object.fromEntries(
    TUNABLE_TOKENS.flatMap((token) => {
      const value = values[`--${token.global}` as SizingToken];
      return value === undefined ? [] : [[token.global, Number.parseFloat(value)]];
    }),
  );

/** The given tuned variables, for an unlayered `<style>` that wins over `tailwind.css` and the sizing theme. */
export const tokenCss = (globals: Record<string, number>): string => {
  const declarations = TUNABLE_TOKENS.filter((token) => globals[token.global] !== undefined)
    .map((token) => `--${token.global}:${tokenValue(globals, token)}${token.unit};`)
    .join('');
  return declarations === '' ? '' : `:root{${declarations}}`;
};

/** A value as the panel and the foundation pages print it: as many decimals as the token's step; `full` for a round. */
export const formatToken = (token: TunableToken, value: number): string => {
  if (token.full !== undefined && value === token.full) return 'full';
  const decimals = token.step >= 1 ? 0 : (String(token.step).split('.')[1]?.length ?? 0);
  return `${value.toFixed(decimals)}${token.unit}`;
};
