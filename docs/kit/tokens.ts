/**
 * The tunable scales and their defaults, as in `tailwind.css`. Shared by the foundation pages and the
 * docs customize panel (`site/customize.tsx`), so it imports nothing.
 */

export const SPACING_STEPS = [
  { name: 'tight', px: 4 },
  { name: 'related', px: 8 },
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
  { name: 'caption', px: 12, lineHeight: 16, tracking: undefined, weight: 400 },
  { name: 'overline', px: 10, lineHeight: 16, tracking: '0.06em', weight: 500 },
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
  { name: 'control-xs', px: 4, use: 'Controls 16–20px: checkbox' },
  { name: 'control-sm', px: 8, use: 'Controls 24–28px' },
  { name: 'control', px: 10, use: 'Controls 32–36px' },
  { name: 'control-lg', px: 12, use: 'Controls and fields 40–44px' },
  { name: 'popup', px: 16, use: 'Menus, popovers, selects, tooltips' },
  { name: 'card', px: 16, use: 'Card shell, Alert' },
  { name: 'dialog', px: 20, use: 'Dialogs, sheets' },
  { name: 'panel', px: 20, use: 'The page panel' },
] as const;

export type RadiusRole = (typeof RADIUS_ROLES)[number];

export const radiusToken = (role: RadiusRole): TunableToken => ({
  global: `radius-${role.name}`,
  label: role.name,
  defaultValue: role.px,
  unit: 'px',
  min: 0,
  max: 32,
  step: 1,
});

export const TOKEN_GROUPS: ReadonlyArray<TokenGroup> = [
  { title: 'Spacing', tokens: SPACING_STEPS.map((step) => spacingToken(step)) },
  { title: 'Type', tokens: TYPE_ROLES.flatMap((role) => [typeSizeToken(role), typeLineHeightToken(role)]) },
  { title: 'Radius', tokens: RADIUS_ROLES.map((role) => radiusToken(role)) },
];

const TUNABLE_TOKENS = TOKEN_GROUPS.flatMap((group) => group.tokens);

export const DEFAULT_TOKEN_GLOBALS: Record<string, number> = Object.fromEntries(
  TUNABLE_TOKENS.map((token) => [token.global, token.defaultValue]),
);

/** A token's tuned value from the globals; anything that is not a number in range falls back to the default. */
export const tokenValue = (globals: Record<string, unknown>, token: TunableToken): number => {
  const value = Number(globals[token.global]);
  return Number.isFinite(value) && value >= token.min && value <= token.max ? value : token.defaultValue;
};

export const spacingValue = (globals: Record<string, unknown>, step: SpacingStep): number =>
  tokenValue(globals, spacingToken(step));

/** Every tunable variable at its tuned value, for an unlayered `<style>` that wins over `tailwind.css`. */
export const tokenCss = (globals: Record<string, unknown>): string =>
  `:root{${TUNABLE_TOKENS.map((token) => `--${token.global}:${tokenValue(globals, token)}${token.unit};`).join('')}}`;

/** A value as the panel and the foundation pages print it: as many decimals as the token's step. */
export const formatToken = (token: TunableToken, value: number): string => {
  const decimals = token.step >= 1 ? 0 : (String(token.step).split('.')[1]?.length ?? 0);
  return `${value.toFixed(decimals)}${token.unit}`;
};
