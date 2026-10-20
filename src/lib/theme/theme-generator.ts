/** Generates a theme's tokens from a base, an accent and a contrast. Based on Linear's theme generator. */

import {
  adjust,
  adjustTo,
  ANY_COLOR_REGEX,
  fromCss,
  getTextColor,
  mix,
  sufficientContrastForText,
  toCss,
  type Color,
  type ColorAdjustment,
  type ColorFormat,
} from './color';

type ThemeType = 'base' | 'elevated' | 'sub' | 'sidebar' | 'menu' | 'selected' | 'focus';

/** A custom theme: `{ base, accent, contrast, sidebarInput? }`, contrast 0..100. */
interface CustomThemeColors {
  base: Color;
  accent: Color;
  contrast: number;
}

export interface ThemeInput extends CustomThemeColors {
  colorFormat: ColorFormat;
  elevation?: number;
  baseTheme?: Theme;
  _themeType?: ThemeType;
  sidebarInput?: CustomThemeColors & { colorFormat?: ColorFormat };
}

type ThemeColorToken =
  | 'bgSub'
  | 'bgSubHover'
  | 'bgBase'
  | 'bgBaseHover'
  | 'bgShade'
  | 'bgShadeHover'
  | 'bgSelected'
  | 'bgSelectedHover'
  | 'bgFocus'
  | 'bgBorder'
  | 'bgBorderHover'
  | 'bgBorderThin'
  | 'bgBorderFaint'
  | 'bgBorderFaintHover'
  | 'bgBorderFaintThin'
  | 'bgBorderSolid'
  | 'bgBorderSolidHover'
  | 'bgBorderSolidThin'
  | 'bgBorderStrong'
  | 'bgBorderStrongHover'
  | 'bgBorderStrongThin'
  | 'bgBorderAlpha'
  | 'bgBorderAlphaHover'
  | 'bgBorderAlphaThin'
  | 'bgBorderFaintAlpha'
  | 'bgBorderFaintAlphaHover'
  | 'bgBorderFaintAlphaThin'
  | 'bgBorderSolidAlpha'
  | 'bgBorderSolidAlphaHover'
  | 'bgBorderSolidAlphaThin'
  | 'bgBorderStrongAlpha'
  | 'bgBorderStrongAlphaHover'
  | 'bgBorderStrongAlphaThin'
  | 'bgSelectedBorder'
  | 'bgSelectedBorderHover'
  | 'labelBase'
  | 'labelBaseHover'
  | 'labelFaint'
  | 'labelLink'
  | 'labelMuted'
  | 'labelMutedHover'
  | 'labelTitle'
  | 'labelTitleHover'
  | 'bgModalOverlay'
  | 'controlPrimary'
  | 'controlPrimaryHover'
  | 'controlPrimaryLabel'
  | 'controlSecondary'
  | 'controlSecondaryHover'
  | 'controlSecondarySelected'
  | 'controlSecondaryLabel'
  | 'controlTertiary'
  | 'controlTertiaryHover'
  | 'controlTertiaryLabel'
  | 'controlTertiarySelected'
  | 'scrollbarBg'
  | 'scrollbarBgHover'
  | 'scrollbarBgActive'
  | 'chromeTabBg'
  | 'chromeTabBgHover'
  | 'chromeTabBgActive'
  | 'blueBase'
  | 'blueBaseHover'
  | 'blueBg'
  | 'blueMid'
  | 'blueText'
  | 'blueForeground'
  | 'blueTint'
  | 'greenBase'
  | 'greenBaseHover'
  | 'greenBg'
  | 'greenMid'
  | 'greenText'
  | 'greenForeground'
  | 'greenTint'
  | 'orangeBase'
  | 'orangeBaseHover'
  | 'orangeBg'
  | 'orangeMid'
  | 'orangeText'
  | 'orangeForeground'
  | 'orangeTint'
  | 'purpleBase'
  | 'purpleBaseHover'
  | 'purpleBg'
  | 'purpleMid'
  | 'purpleText'
  | 'purpleForeground'
  | 'purpleTint'
  | 'redBase'
  | 'redBaseHover'
  | 'redBg'
  | 'redMid'
  | 'redText'
  | 'redForeground'
  | 'redTint'
  | 'tealBase'
  | 'tealBaseHover'
  | 'tealBg'
  | 'tealMid'
  | 'tealText'
  | 'tealForeground'
  | 'tealTint'
  | 'yellowBase'
  | 'yellowBaseHover'
  | 'yellowBg'
  | 'yellowMid'
  | 'yellowText'
  | 'yellowForeground'
  | 'yellowTint'
  | 'scrollBackground'
  | 'shadowColor'
  | 'focusColor'
  | 'githubLogo'
  | 'sidebarLinkBg'
  | 'sidebarLinkBgActive';

type ThemeColor = Record<ThemeColorToken, string>;

export interface Theme {
  hash: string;
  shadowColor: string;
  contrast: number;
  colorFormat: ColorFormat;
  focusShadow: string;
  shadowLow: string;
  shadowBorder: string;
  shadowMedium: string;
  shadowHigh: string;
  shadowInset: string;
  inputPadding: string;
  inputPaddingBlock: string;
  inputPaddingInline: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderRadius: string;
  inputFontSize: string;
  color: ThemeColor;
  isDark: boolean;
  highlightVariant: (css: string) => string;
  textHighlight: (this: Theme, css: string, amount: number) => string;
  elevatedTheme: () => Theme;
  subTheme: () => Theme;
  sidebarTheme: () => Theme;
  menuTheme: () => Theme;
  selectedTheme: () => Theme;
  focusTheme: () => Theme;
  baseTheme?: Theme;
}

/** Thin borders get their own step only on 2x displays; elsewhere they equal the regular border. */
const isHighDensityDisplay =
  (typeof window !== 'undefined' &&
    window.matchMedia?.('only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi)')
      .matches) ||
  false;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function mapValues<T extends object, R>(object: T, fn: (value: T[keyof T], key: keyof T) => R): { [K in keyof T]: R } {
  const out = {} as { [K in keyof T]: R };
  (Object.keys(object) as (keyof T)[]).forEach((key) => {
    out[key] = fn(object[key], key);
  });
  return out;
}

const themeCache = new Map<string, Theme>();

/** Memoized per input hash. The cache is unbounded. */
export function generateTheme(input: ThemeInput): Theme {
  const hash = hashThemeInput(input);
  const cached = themeCache.get(hash);
  if (cached) return cached;
  const theme = buildTheme(input, hash);
  themeCache.set(hash, theme);
  return theme;
}

function buildTheme(input: ThemeInput, hash: string): Theme {
  const base = input.base;
  const isLight = base[0] > 50;
  const isPureLight = isLight && base[0] > 97 && base[1] < 8;

  const surfaceContrast = Math.min(input.contrast, 30) + Math.max(input.contrast - 30, 0) * 0.25;
  const surfaceFactor = ((isLight ? -1 : 1) * surfaceContrast) / 30;
  const surface = (color: Color, delta: ColorAdjustment): Color =>
    adjust(
      color,
      mapValues(delta, (value) => value && value * surfaceFactor),
    );

  const controlContrast = Math.min(input.contrast, 30) + Math.max(input.contrast - 30, 0) * 0.25;
  const controlFactor = ((isLight ? -0.8 : 1) * controlContrast) / 70;
  const control = (color: Color, delta: ColorAdjustment): Color =>
    adjust(
      color,
      mapValues(delta, (value) => value && value * controlFactor),
    );

  const borderFactor = ((isLight ? -0.9 : 0.8) * (input.contrast + Math.max(input.contrast - 30, 0) * 0.4)) / 10;
  const border = (color: Color, delta: ColorAdjustment): Color =>
    adjust(color, { ...delta, l: delta.l && delta.l * borderFactor, c: (delta.c ?? 0) * borderFactor });

  const textFactor = ((isLight ? -1 : 1) * (3 + (100 - input.contrast) / 70)) / 4;
  const text = (color: Color, delta: ColorAdjustment, override?: ColorAdjustment): Color => {
    const adjusted = adjust(getTextColor(color), { ...delta, l: delta.l && delta.l * textFactor });
    return override ? adjustTo(adjusted, override) : adjusted;
  };

  const alphaBoost = Math.max(1, 1 + Math.max(input.contrast - 30, 0) / (isLight ? 50 : 10));
  const blackAlpha = (alpha: number): string => toCss(input.colorFormat, [0, 0, 0, alpha * alphaBoost]);
  const textLightnessScale = (1 + Math.abs(base[0] - 50) / 50) / 2;

  const bgBaseHover = surface(base, isLight ? { l: 3.5 } : { l: 4.25, c: 0.5 });
  const bgSub = surface(base, isLight ? { l: 3.5 } : { l: -3.25, c: 0 });
  const bgSubHover = surface(bgSub, isLight ? { l: 5 } : { l: 2.5, c: 3 });
  const bgShade = surface(base, isLight ? { l: 5.5 } : { l: 2, c: 0.5 });
  const bgShadeHover = surface(bgShade, isLight ? { l: 1.5 } : { l: 1, c: 0.5 });

  const bgBorder = border(base, isLight ? { l: 3.5, c: 1 } : { l: 4, c: 0.5 });
  const bgBorderHover = border(base, isLight ? { l: 4.5, c: 1 } : { l: 5, c: 0.5 });
  const bgBorderThin = isHighDensityDisplay ? border(base, isLight ? { l: 3, c: 1 } : { l: 6, c: 0.5 }) : bgBorder;
  const bgBorderFaint = border(base, isLight ? { l: 1, c: 1 } : { l: 2, c: 0.5 });
  const bgBorderFaintHover = border(base, isLight ? { l: 2, c: 1 } : { l: 2.75, c: 0.5 });
  const bgBorderFaintThin = isHighDensityDisplay
    ? border(base, isLight ? { l: 3, c: 1 } : { l: 3.5, c: 0.5 })
    : bgBorderFaint;
  const bgBorderSolid = border(base, isLight ? { l: 5, c: 1 } : { l: 5, c: 0.5 });
  const bgBorderSolidHover = border(base, isLight ? { l: 9, c: 1 } : { l: 7, c: 0.5 });
  const bgBorderSolidThin = isHighDensityDisplay
    ? border(base, isLight ? { l: 5, c: 1 } : { l: 10, c: 0.5 })
    : bgBorderSolid;
  const bgBorderStrong = border(base, isLight ? { l: 17, c: 1 } : { l: 20, c: 0.5 });
  const bgBorderStrongHover = border(base, isLight ? { l: 21, c: 1 } : { l: 24, c: 0.5 });
  const bgBorderStrongThin = isHighDensityDisplay
    ? border(base, isLight ? { l: 17, c: 1 } : { l: 26, c: 0.5 })
    : bgBorderStrong;

  // Alpha-over-base, so borders composite correctly on images and gradients.
  const borderToAlpha = (color: Color): Color => {
    const alpha = isLight ? ((base[0] - color[0]) / base[0]) * 1.09 : (color[0] - base[0]) / (100 - base[0]);
    return [isLight ? 0 : 100, 0, 0, clamp(alpha, 0, 1)];
  };

  const bgSelected = mix(base, input.accent, (1 + base[1] / 30) * (isLight ? 0.18 : 0.05));
  const bgSelectedHover = surface(bgSelected, isLight ? { l: 2 } : { l: 2.5, c: 2 });

  const labelTitle = text(base, { l: isLight ? -10 * textLightnessScale : 10 }, { c: 0 });
  const labelBase = text(base, { l: (isLight ? -20 : -10) * textLightnessScale, c: 1 });
  const labelMuted = text(base, { l: -40 * textLightnessScale, c: 1 });
  const labelFaint = text(base, { l: -66 * textLightnessScale, c: 1 });
  const labelLink = text(base, { l: -45 * textLightnessScale }, { h: input.accent[2], c: 70 });

  // Hover moves a label further from the base; it flips direction when it would overshoot L=100.
  const labelHoverStrength = (isLight ? 30 : 15) * (1 + Math.max(input.contrast - 30, 0) / 70);
  const labelHover = (color: Color): Color => {
    const step = labelHoverStrength * (Math.abs(color[0] - base[0]) / 100);
    return adjust(color, { l: color[0] > 100 - step ? -step : step });
  };

  const controlPrimary = input.accent;
  const controlSecondary = control(base, isLight ? { l: -6 } : { l: 12, c: 0.75 });
  const controlTertiary = control(base, isLight ? { l: -6 } : { l: 12, c: 0.5 });
  const controlTertiaryHover = control(base, isLight ? { l: 9 } : { l: 22, c: 0.5 });
  const controlTertiarySelected = control(base, isLight ? { l: 13, c: 0 } : { l: 29, c: 1.5 });

  const purple: Color = [48, 59.31, 288.43];
  const inheritedFocus = input.baseTheme ? fromCss(input.baseTheme.color.focusColor) : input.accent;
  const focusIsVivid = inheritedFocus[1] > 50 && (isLight ? inheritedFocus[0] < 90 : inheritedFocus[0] > 30);
  // A near-gray accent has no meaningful hue, so the focus ring falls back to brand purple.
  const focusHue = inheritedFocus[1] < 20 ? purple[2] : inheritedFocus[2];
  const focusColor = focusIsVivid
    ? inheritedFocus
    : adjustTo(inheritedFocus, isLight ? { l: 70, c: 90, h: focusHue } : { l: 50, c: 120, h: focusHue });

  const blue: Color = [80, 70, 267];
  const teal: Color = [67.5, 45, 210];
  const green: Color = isLight ? [68, 64.37, 141.95] : [60, 64.37, 141.95];
  const yellow: Color = [80, 90, 85];
  const orange: Color = [66, 80, 48];
  const red: Color = [58, 73, 29];

  const purpleBg = findAccessibleColor(purple, labelTitle) || purple;
  const blueBg = findAccessibleColor(blue, labelTitle) || blue;
  const tealBg = findAccessibleColor(teal, labelTitle) || teal;
  const greenBg = findAccessibleColor(green, labelTitle) || green;
  const yellowBg = findAccessibleColor(yellow, labelTitle) || yellow;
  const orangeBg = findAccessibleColor(orange, labelTitle) || orange;
  const redBg = findAccessibleColor(red, labelTitle) || red;
  const tintAmount = isLight ? 0.2 : 0.03;

  const colors: Record<ThemeColorToken, Color> = {
    bgSub,
    bgSubHover,
    bgBase: base,
    bgBaseHover,
    bgShade,
    bgShadeHover,
    bgSelected,
    bgSelectedHover,
    bgFocus: surface(base, isLight ? { l: 5 } : { l: 9, c: 0.5 }),
    bgBorder,
    bgBorderHover,
    bgBorderThin,
    bgBorderFaint,
    bgBorderFaintHover,
    bgBorderFaintThin,
    bgBorderSolid,
    bgBorderSolidHover,
    bgBorderSolidThin,
    bgBorderStrong,
    bgBorderStrongHover,
    bgBorderStrongThin,
    bgBorderAlpha: borderToAlpha(bgBorder),
    bgBorderAlphaHover: borderToAlpha(bgBorderHover),
    bgBorderAlphaThin: borderToAlpha(bgBorderThin),
    bgBorderFaintAlpha: borderToAlpha(bgBorderFaint),
    bgBorderFaintAlphaHover: borderToAlpha(bgBorderFaintHover),
    bgBorderFaintAlphaThin: borderToAlpha(bgBorderFaintThin),
    bgBorderSolidAlpha: borderToAlpha(bgBorderSolid),
    bgBorderSolidAlphaHover: borderToAlpha(bgBorderSolidHover),
    bgBorderSolidAlphaThin: borderToAlpha(bgBorderSolidThin),
    bgBorderStrongAlpha: borderToAlpha(bgBorderStrong),
    bgBorderStrongAlphaHover: borderToAlpha(bgBorderStrongHover),
    bgBorderStrongAlphaThin: borderToAlpha(bgBorderStrongThin),
    bgSelectedBorder: border(bgSelected, { l: 3.5, c: 1 }),
    bgSelectedBorderHover: border(bgSelected, { l: 4.5, c: 1 }),
    labelBase,
    labelBaseHover: labelHover(labelBase),
    labelFaint,
    labelLink,
    labelMuted,
    labelMutedHover: labelHover(labelMuted),
    labelTitle,
    labelTitleHover: labelHover(labelTitle),
    bgModalOverlay: [0, 0, 0, clamp((isLight ? 0.25 : 0.4) * alphaBoost, 0, 0.8)],
    controlPrimary,
    controlPrimaryHover: surface(controlPrimary, { l: isLight ? 6 : 5, c: 2 }),
    controlPrimaryLabel: text(input.accent, {}, { c: Math.min(5, input.accent[1]) }),
    controlSecondary,
    controlSecondaryHover: control(controlSecondary, { l: 12, c: 1 }),
    controlSecondarySelected: control(controlSecondary, isLight ? { l: 15, c: 1 } : { l: 22, c: 1 }),
    controlSecondaryLabel: labelBase,
    controlTertiary,
    controlTertiaryHover,
    controlTertiaryLabel: labelBase,
    controlTertiarySelected,
    scrollbarBg: adjust(labelFaint, { l: 0.3 }),
    scrollbarBgHover: adjust(labelFaint, isLight ? { l: 0.8 } : { l: 0.4 }),
    scrollbarBgActive: labelFaint,
    chromeTabBg: surface(base, { l: isLight ? -2.5 : 5, c: isLight ? 0 : 2 }),
    chromeTabBgHover: surface(base, { l: isLight ? -5 : 7, c: isLight ? 0 : 2 }),
    chromeTabBgActive: surface(base, { l: isLight ? -8 : 10, c: isLight ? 0 : 2 }),
    blueBase: blue,
    blueBaseHover: surface(blue, { l: 5 }),
    blueBg,
    blueMid: surface(blue, { l: 8 }),
    blueText: text(blue, {}, { l: isLight ? 50 : 80, c: 80 }),
    blueForeground: getTextColor(blueBg),
    blueTint: mix(base, blue, tintAmount),
    greenBase: green,
    greenBaseHover: surface(green, { l: 5 }),
    greenBg,
    greenMid: surface(green, { l: 8 }),
    greenText: text(green, {}, { l: isLight ? 50 : 80, c: 80 }),
    greenForeground: getTextColor(greenBg),
    greenTint: mix(base, green, tintAmount),
    orangeBase: orange,
    orangeBaseHover: surface(orange, { l: 5 }),
    orangeBg,
    orangeMid: surface(orange, { l: 8 }),
    orangeText: text(orange, {}, { l: isLight ? 50 : 80, c: 80 }),
    orangeForeground: getTextColor(orangeBg),
    orangeTint: mix(base, orange, tintAmount),
    purpleBase: purple,
    purpleBaseHover: surface(purple, { l: 5 }),
    purpleBg,
    purpleMid: surface(purple, { l: 8 }),
    purpleText: text(purple, {}, { l: isLight ? 50 : 80, c: 80 }),
    purpleForeground: getTextColor(purpleBg),
    purpleTint: mix(base, purple, tintAmount),
    redBase: red,
    redBaseHover: surface(red, { l: 5 }),
    redBg,
    redMid: surface(red, { l: 8 }),
    redText: text(red, {}, { l: isLight ? 50 : 80, c: 80 }),
    redForeground: getTextColor(redBg),
    redTint: mix(base, red, tintAmount),
    tealBase: teal,
    tealBaseHover: surface(teal, { l: 5 }),
    tealBg,
    tealMid: surface(teal, { l: 8 }),
    tealText: text(teal, {}, { l: isLight ? 50 : 80, c: 80 }),
    tealForeground: getTextColor(tealBg),
    tealTint: mix(base, teal, tintAmount),
    yellowBase: yellow,
    yellowBaseHover: surface(yellow, { l: 5 }),
    yellowBg,
    yellowMid: surface(yellow, { l: 8 }),
    yellowText: text(yellow, {}, { l: isLight ? 50 : 80, c: 80 }),
    yellowForeground: getTextColor(yellowBg),
    yellowTint: mix(base, yellow, tintAmount),
    scrollBackground: isLight ? [100, 0, 0, 0] : [0, 0, 0, 0.004],
    shadowColor: border(isLight ? [0, 0, 0, 0.03] : [0, 0, 0, 0.15], { l: 1 }),
    focusColor,
    githubLogo: labelMuted,
    sidebarLinkBg: surface(base, isLight ? { l: 2.8 } : { l: 6.5, c: 1 }),
    sidebarLinkBgActive: surface(base, isLight ? { l: 4.9 } : { l: 12.5, c: 1 }),
  };

  const color = mapValues(colors, (value) => toCss(input.colorFormat, value));

  let elevated: Theme | undefined;
  let sub: Theme | undefined;
  let sidebar: Theme | undefined;
  let menu: Theme | undefined;
  let focus: Theme | undefined;
  let selected: Theme | undefined;

  const alpha02 = blackAlpha(0.02);
  const alpha04 = blackAlpha(0.04);
  const alpha06 = blackAlpha(0.06);
  const alpha07 = blackAlpha(0.07);
  const alpha08 = blackAlpha(0.08);
  const alpha10 = blackAlpha(0.1);
  const alpha125 = blackAlpha(0.125);
  const alpha30 = blackAlpha(0.3);

  const parseHighlightBase = (css: string): Color =>
    css === color.bgBase ? base : ANY_COLOR_REGEX.test(css) ? fromCss(css) : base;

  const theme: Theme = {
    hash,
    shadowColor: color.shadowColor,
    contrast: input.contrast,
    colorFormat: input.colorFormat,
    focusShadow: `0 0 0 1px ${color.focusColor}`,
    shadowLow: isLight ? `0px 3px 6px -2px ${alpha02}, 0px 1px 1px ${alpha04}` : `0px 0.5px 1px 1px ${alpha30}`,
    shadowBorder: `0 0 0 0.5px ` + color.bgBorder,
    shadowMedium: isLight
      ? `0 6px 18px ${alpha02}, 0 3px 9px ${alpha04}, 0 1px 1px ${alpha04}`
      : `0 3px 8px ${alpha125}, 0 2px 5px ${alpha125}, 0 1px 1px ${alpha125}`,
    shadowHigh: isLight
      ? `0 9px 48px ${alpha08}, 0 6px 24px ${alpha10},  0 1px 1px ${alpha04}`
      : `0 4px 40px ${alpha10}, 0 3px 20px ${alpha125},0 3px 12px ${alpha125}, 0 2px 8px ${alpha125}, 0 1px 1px ${alpha125}`,
    shadowInset: `0 1px 1px inset ${alpha07}, 0 1px 3px inset ${alpha07}, 0 2px 5px inset ${alpha10}`,
    inputPadding: `6px 12px`,
    inputPaddingBlock: `6px`,
    inputPaddingInline: `12px`,
    inputBackground: color.bgBase,
    inputBorder: `1px solid ${color.bgBorder}`,
    inputBorderRadius: `8px`,
    inputFontSize: `0.8125rem`,
    color,
    isDark: !isLight,
    highlightVariant: (css) => {
      const parsed = fromCss(css);
      const delta = isPureLight ? (parsed[1] > 2 ? { l: -5, c: 6 } : { l: -8 }) : { l: 8, c: 5 };
      return toCss(input.colorFormat, adjust(parsed, delta));
    },
    textHighlight(css, amount) {
      return toCss(
        input.colorFormat,
        mix(
          parseHighlightBase(this.color.bgBase),
          isLight ? adjust(fromCss(css), { l: 7, c: 8 }) : fromCss(css),
          amount,
        ),
      );
    },
    elevatedTheme: () => {
      elevated ||=
        input.elevation === -1 && input.baseTheme
          ? input.baseTheme
          : generateTheme({
              ...input,
              elevation: (input.elevation ?? 0) + 1,
              baseTheme: theme,
              _themeType: 'elevated',
              base: surface(colors.bgBase, { l: isLight ? -8 : 4.125, c: isLight && !isPureLight ? 0 : 0.5 }),
            });
      return elevated;
    },
    subTheme: () => {
      sub ||=
        !isPureLight && input.elevation === 1 && input.baseTheme
          ? input.baseTheme
          : {
              ...generateTheme({
                ...input,
                elevation: (input.elevation ?? 0) - 1,
                base: bgSub,
                baseTheme: theme,
                _themeType: 'sub',
              }),
            };
      return sub;
    },
    sidebarTheme: () => {
      if (!sidebar) {
        sidebar = input.sidebarInput
          ? generateTheme({ ...input, ...input.sidebarInput, baseTheme: theme, _themeType: 'sidebar' })
          : theme.subTheme();
        const reference = input.sidebarInput ? sidebar.elevatedTheme() : theme;
        const sidebarIsLight = input.sidebarInput ? input.sidebarInput.base[0] > 50 : isLight;
        const sidebarIsPureLight = input.sidebarInput
          ? sidebarIsLight && input.sidebarInput.base[0] > 97 && input.sidebarInput.base[1] < 8
          : isPureLight;
        // Mutates the shared `color` object: memoized themes see these overrides too.
        sidebar.color.controlTertiaryHover = sidebarIsLight ? alpha06 : reference.color.controlSecondary;
        sidebar.color.controlSecondary = sidebarIsPureLight
          ? reference.color.bgBase
          : sidebarIsLight
            ? reference.color.bgShade
            : reference.color.controlSecondary;
        sidebar.color.controlSecondaryHover = sidebarIsPureLight
          ? reference.color.bgBaseHover
          : sidebarIsLight
            ? reference.color.bgShadeHover
            : reference.color.controlSecondaryHover;
      }
      return sidebar;
    },
    menuTheme: () => {
      menu ||=
        (theme.baseTheme !== undefined &&
          !['base', 'elevated'].includes(input._themeType ?? '') &&
          theme.baseTheme?.menuTheme()) ||
        generateTheme({
          ...input,
          baseTheme: theme,
          _themeType: 'menu',
          base: surface(colors.bgBase, { l: isLight ? -8 : 8, c: isLight && !isPureLight ? 0 : 0.5 }),
        });
      return menu;
    },
    selectedTheme: () => {
      selected ||= generateTheme({ ...input, base: colors.bgSelected, baseTheme: theme, _themeType: 'selected' });
      return selected;
    },
    focusTheme: () => {
      focus ||= generateTheme({ ...input, base: colors.bgFocus, baseTheme: theme, _themeType: 'focus' });
      return focus;
    },
    baseTheme: input.baseTheme,
  };
  return theme;
}

/**
 * Binary-searches L so `anchor` passes APCA 38 against `textRef`, preferring L near the text.
 * Falls back to reducing chroma in quarters; `undefined` when nothing passes.
 */
function findAccessibleColor(anchor: Color, textRef: Color): Color | undefined {
  const [anchorL, anchorC, anchorH] = anchor;
  const [textL] = textRef;
  let low = 0;
  let high = 100;
  let best = high;
  let found = false;
  while (high - low > 1) {
    const middle = (low + high) / 2;
    const candidate: Color = [middle, anchorC, anchorH];
    if (sufficientContrastForText(textRef, candidate)) {
      found = true;
      best = middle;
      if (textL > middle) low = middle;
      else high = middle;
    } else if (textL > middle) high = middle;
    else low = middle;
  }
  if (found) return [best, anchorC, anchorH];
  for (const chroma of [anchorC * 0.75, anchorC * 0.5, anchorC * 0.25, 0]) {
    low = anchorL;
    high = 100;
    best = high;
    found = false;
    while (high - low > 0.1) {
      const middle = (low + high) / 2;
      const candidate: Color = [middle, chroma, anchorH];
      if (sufficientContrastForText(candidate, textRef)) {
        found = true;
        best = middle;
        high = middle;
      } else low = middle;
    }
    if (found) return [best, chroma, anchorH];
  }
  return undefined;
}

/**
 * Key-sorted JSON of the input: unordered objects, ordered arrays, `baseTheme` replaced by its hash.
 */
function hashThemeInput(input: ThemeInput): string {
  const baseThemeHash = input.baseTheme?.hash;
  return stableStringify(typeof baseThemeHash === 'string' ? { ...input, baseTheme: baseThemeHash } : input);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(',')}}`;
  }
  return value === undefined ? 'undefined' : JSON.stringify(value);
}
