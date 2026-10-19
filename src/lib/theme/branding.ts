/** Tailwind's gray scales. */
export const BRAND_BASE_COLORS = [
  'neutral',
  'zinc',
  'gray',
  'slate',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive',
] as const;
export type BrandBaseColor = (typeof BRAND_BASE_COLORS)[number];

/** Tailwind's chromatic scales. */
export const BRAND_PRIMARY_COLORS = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const;
export type BrandPrimaryColor = (typeof BRAND_PRIMARY_COLORS)[number];

export const BRAND_DESTRUCTIVE_COLORS = ['red', 'rose', 'orange'] as const;
export type BrandDestructiveColor = (typeof BRAND_DESTRUCTIVE_COLORS)[number];

/** The three names a theme is generated from (`brandingThemeCss`). */
export interface BrandingTheme {
  readonly primaryColor: BrandPrimaryColor;
  readonly baseColor: BrandBaseColor;
  readonly destructiveColor: BrandDestructiveColor;
}

export const DEFAULT_BRANDING_THEME: BrandingTheme = {
  primaryColor: 'blue',
  baseColor: 'zinc',
  destructiveColor: 'red',
};
