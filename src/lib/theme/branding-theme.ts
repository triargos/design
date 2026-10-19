import type { OrganizationBrandingTheme } from '@elternportal/domain/organization-branding';

import { BRAND_ANCHORS } from './brand-anchors';
import { toCss, type Color } from './color';
import { generateTheme, type ThemeInput } from './theme-generator';
import { intentVars, surfaceRules, themeToShadcnVars, type FillTint } from './theme-to-css';

export type ThemeMode = 'light' | 'dark';

/** Base lightness and contrast of the `lightDefault` / `darkDefault` presets. */
const BASE_LIGHTNESS: Record<ThemeMode, number> = { light: 97.94, dark: 5.52 };
const CONTRAST: Record<ThemeMode, number> = { light: 30, dark: 27 };

/**
 * Contrast under `prefers-contrast: more`. Text, borders and fills spread further from the base; the high-contrast
 * presets use 90, which flattens our quiet fills, so this stops short.
 */
const CONTRAST_MORE: Record<ThemeMode, number> = { light: 70, dark: 70 };

/**
 * The default presets' base chroma (0.5 light, 0.4 dark) sits on a cool gray hue. Every base anchor is scaled by the
 * same ratio, so zinc (the default) reproduces that gray and the other grays keep their relative tint.
 */
const BASE_CHROMA_SCALE: Record<ThemeMode, number> = {
  light: 0.5 / BRAND_ANCHORS.zinc[1],
  dark: 0.4 / BRAND_ANCHORS.zinc[1],
};

/**
 * Chroma added to the base toward the primary's hue. The previous palette mixed every neutral 20% toward the
 * primary (light, orange: page 0.5, sidebar 1.5, muted 3.3); this keeps about a quarter of that on light surfaces.
 */
const PRIMARY_TINT_CHROMA: Record<ThemeMode, number> = { light: 0.5, dark: 0 };

/**
 * The quiet fills (`--muted`, `--shell`, `--field`) lean a tad toward the primary's hue, the same direction as the
 * light page tint (`PRIMARY_TINT_CHROMA`): a warm primary gives warm grays, a cool one cool grays. Chroma 3 read as
 * colored (blue on indigo); 1 reads as a gray with a temperature.
 */
const FILL_CHROMA: Record<ThemeMode, number> = { light: 1, dark: 0.5 };

const fillTint = (theme: OrganizationBrandingTheme, mode: ThemeMode): FillTint => ({
  c: FILL_CHROMA[mode],
  h: BRAND_ANCHORS[theme.primaryColor][2],
});

/** Adds `chroma` toward `hue` to `[c, h]`, as vectors in the LCH a/b plane. */
function tintToward([chroma, hue]: [number, number], towardHue: number, tint: number): [number, number] {
  const radians = Math.PI / 180;
  const a = chroma * Math.cos(hue * radians) + tint * Math.cos(towardHue * radians);
  const b = chroma * Math.sin(hue * radians) + tint * Math.sin(towardHue * radians);
  return [Math.hypot(a, b), (Math.atan2(b, a) / radians + 360) % 360];
}

export function brandingThemeInput(
  theme: OrganizationBrandingTheme,
  mode: ThemeMode,
  contrast: number = CONTRAST[mode],
): ThemeInput {
  const [, baseChroma, baseHue] = BRAND_ANCHORS[theme.baseColor];
  const primary = BRAND_ANCHORS[theme.primaryColor];
  const [chroma, hue] = tintToward(
    [baseChroma * BASE_CHROMA_SCALE[mode], baseHue],
    primary[2],
    PRIMARY_TINT_CHROMA[mode],
  );
  return {
    base: [BASE_LIGHTNESS[mode], chroma, hue],
    accent: primary,
    contrast,
    colorFormat: 'LCH',
  };
}

/** The destructive intent on the organization's destructive anchor instead of the generator's red; its solid is the anchor. */
export function destructiveVars(anchor: Color, mode: ThemeMode): Record<string, string> {
  return {
    ...intentVars('destructive', anchor[2], mode === 'dark'),
    '--destructive-solid': toCss('LCH', anchor),
  };
}

const declarations = (vars: Record<string, string>): string =>
  Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join('');

/**
 * The page rule (`:root` or `.dark`) and one rule per nested surface. Dark surface selectors are prefixed with `.dark`,
 * so they outrank the light ones on the same element.
 */
const modeCss = (theme: OrganizationBrandingTheme, mode: ThemeMode, contrast: number): string => {
  const page = generateTheme(brandingThemeInput(theme, mode, contrast));
  const tint = fillTint(theme, mode);
  const pageVars = {
    ...themeToShadcnVars(page, tint),
    ...destructiveVars(BRAND_ANCHORS[theme.destructiveColor], mode),
  };
  const scope = mode === 'light' ? ':root' : '.dark';
  const surfaces = surfaceRules(page, tint).map(
    ({ selector, vars }) => `${mode === 'light' ? '' : '.dark '}${selector} {${declarations(vars)}}`,
  );
  return [`${scope} {${declarations(pageVars)}}`, ...surfaces].join(' ');
};

const cssCache = new Map<string, string>();

/**
 * The `:root` (light) and `.dark` color rules for an organization's branding, each followed by its `[data-surface]`
 * rules, then the same at `CONTRAST_MORE` under `prefers-contrast: more`. Memoized per stored color names.
 */
export function brandingThemeCss(theme: OrganizationBrandingTheme): string {
  const key = `${theme.baseColor}/${theme.primaryColor}/${theme.destructiveColor}`;
  const cached = cssCache.get(key);
  if (cached !== undefined) return cached;
  const regular = `${modeCss(theme, 'light', CONTRAST.light)} ${modeCss(theme, 'dark', CONTRAST.dark)}`;
  const more = `${modeCss(theme, 'light', CONTRAST_MORE.light)} ${modeCss(theme, 'dark', CONTRAST_MORE.dark)}`;
  const css = `${regular} @media (prefers-contrast: more) {${more}}`;
  cssCache.set(key, css);
  return css;
}
