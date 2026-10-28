import { adjust, adjustTo, fromCss, mix, tintToward, toCss, type Color } from './color';
import { generateTheme, type Theme } from './theme-generator';

/**
 * The chroma the quiet fills (`--muted`, `--shell`, `--field`) add toward hue `h`, on top of their surface's own; see
 * `fillTint` in `branding-theme.ts`.
 */
export interface FillTint {
  readonly c: number;
  readonly h: number;
}

/**
 * `--field` lightness from its surface: flat and a step below the surface in both modes. The generator has no such
 * step (dark `bgShade` is +1.8), so these are our own.
 */
const FIELD_STEP = { light: -3.5, dark: -2 };

/** Fields carry less of the fill tint than the shell: on a white card the full tint reads as colored. */
const FIELD_TINT_SCALE = 0.5;

/** Light `--muted` lightness from its surface. The generator's `bgShade` (-5.5) read too gray; dark keeps `bgShade`. */
const MUTED_STEP_LIGHT = -3;

/**
 * Shell lightness from its surface. Light sits a step above the generator's `bgBaseHover` (-3.5), which read too gray;
 * dark `bgShade` (+1.8) left the shell invisible, so dark takes the same step as `DARK_SURFACE_STEP`.
 */
const SHELL_STEP = { light: -2.5, dark: 5 };

/**
 * Dark surface lightness above the page. The generator's nesting steps (`elevatedTheme`, +3.7) leave dark cards
 * barely distinguishable from the page, so dark surfaces are generated from these fixed steps: page → shell (+5) →
 * card (+10) → popup (+14), a card in a popup above that, and a card on a card (+20) above the shell it sits in (+15).
 * Light keeps the generator's nesting (all raised surfaces clamp to white).
 */
const DARK_SURFACE_STEP = { card: 10, popup: 14, popupCard: 18, cardCard: 20 };

/** A theme on the page's base, `l` lighter, with the page's accent and contrast. */
const raisedTheme = (page: Theme, l: number): Theme =>
  generateTheme({
    base: adjust(fromCss(page.color.bgBase), { l }),
    accent: fromCss(page.color.controlPrimary),
    contrast: page.contrast,
    colorFormat: page.colorFormat,
  });

/**
 * The theme of each nested surface. A card on a card steps above the card's shell, so its content never sits darker than
 * the shell around it; deeper cards reuse `cardCard`. A popup is the same wherever it opens.
 */
function surfaceThemes(page: Theme): { card: Theme; cardCard: Theme; popup: Theme; popupCard: Theme } {
  if (page.isDark) {
    return {
      card: raisedTheme(page, DARK_SURFACE_STEP.card),
      cardCard: raisedTheme(page, DARK_SURFACE_STEP.cardCard),
      popup: raisedTheme(page, DARK_SURFACE_STEP.popup),
      popupCard: raisedTheme(page, DARK_SURFACE_STEP.popupCard),
    };
  }
  const card = page.elevatedTheme();
  const popup = page.menuTheme();
  return { card, cardCard: card.elevatedTheme(), popup, popupCard: popup.elevatedTheme() };
}

/**
 * The tokens that mean "one step relative to the surface I'm on". Each surface (`[data-surface]`) re-declares them
 * from its own theme, so `bg-muted` or `bg-field` keeps its step on the page, a card, or a popup. `--surface` is the
 * surface's own color. `--shell` is the tint wrapping a card (card shell, dialog shell, tab track). `--muted`,
 * `--shell` and `--field` add the `FillTint` to the surface's chroma and hue. The text levels below `--foreground`
 * re-declare too: a dark popup sits 14 above the page, and the page's muted text reads under 4.5:1 on it.
 */
function surfaceVars(theme: Theme, tint: FillTint): Record<string, string> {
  const { color } = theme;
  const mode = theme.isDark ? 'dark' : 'light';
  const fieldTint = { c: tint.c * FIELD_TINT_SCALE, h: tint.h };
  const tinted = (fill: Color, fillTint: FillTint): string =>
    toCss(theme.colorFormat, tintToward(fill, fillTint.h, fillTint.c));
  const step = (l: number, stepTint: FillTint): string => tinted(adjust(fromCss(color.bgBase), { l }), stepTint);
  return {
    '--muted': theme.isDark ? tinted(fromCss(color.bgShade), tint) : step(MUTED_STEP_LIGHT, tint),
    '--border-subtle': color.bgBorderFaint,
    '--border': color.bgBorder,
    '--border-strong': color.bgBorderStrong,
    '--surface': color.bgBase,
    '--shell': step(SHELL_STEP[mode], tint),
    '--field': step(FIELD_STEP[mode], fieldTint),
    ...textLevelVars(theme),
  };
}

/**
 * Projects a generated theme onto the custom properties `tailwind.css` maps: the page's surface tokens plus the
 * global ones. `*Thin` tokens are skipped: they depend on the display density, so the server and client render would
 * differ. `destructive` is the theme's destructive anchor; it replaces the generator's red.
 */
export function themeToCssVars(theme: Theme, tint: FillTint, destructive: Color): Record<string, string> {
  const { color } = theme;
  const sidebar = theme.sidebarTheme().color;
  const surfaces = surfaceThemes(theme);
  return {
    ...surfaceVars(theme, tint),
    '--background': color.bgBase,
    '--foreground': color.labelTitle,
    '--card': surfaces.card.color.bgBase,
    '--card-foreground': color.labelTitle,
    '--popover': surfaces.popup.color.bgBase,
    '--popover-foreground': color.labelTitle,
    // Status hues are fixed, not branded; destructive follows the brand, its solid the anchor itself.
    ...intentVars('info', INTENT_HUE.info, theme.isDark),
    ...intentVars('success', INTENT_HUE.success, theme.isDark),
    ...intentVars('warning', INTENT_HUE.warning, theme.isDark),
    ...intentVars('destructive', destructive[2], theme.isDark),
    '--destructive-solid': toCss('LCH', destructive),
    ...primaryVars(theme),
    ...categoryVars(theme.isDark),
    // Translucent title color, so the fill reads one step off any surface it sits on.
    '--disabled': toCss(theme.colorFormat, adjustTo(fromCss(color.labelTitle), { a: theme.isDark ? 0.08 : 0.05 })),
    '--ring': color.focusColor,
    '--sidebar': sidebar.bgBase,
    '--sidebar-foreground': sidebar.labelTitle,
    '--sidebar-border': sidebar.bgBorder,
    '--sidebar-accent': sidebar.sidebarLinkBgActive,
    '--sidebar-accent-foreground': sidebar.labelTitle,
  };
}

/** The fixed hues of the status intents, after the generator's blue, green and orange. */
const INTENT_HUE = { info: 267, success: 152, warning: 60 } as const;

/**
 * Lightness and chroma of each intent role, per mode. `text` is the generator's status text step (light 50, dark 80).
 * `subtle` is a translucent tint with its text a deeper step of the hue, after Cloudflare Kumo's `Banner` (MIT).
 * `solid` carries white text. Warning's solid sits a little lighter and more saturated so it reads as orange, not brown.
 */
const INTENT_STEP = {
  light: {
    text: { l: 50, c: 80 },
    solid: { l: 55, c: 72 },
    warningSolid: { l: 58, c: 80 },
    subtle: { l: 93, c: 14, a: 0.5 },
    subtleText: { l: 38, c: 70 },
    border: { l: 50, c: 70, a: 0.32 },
  },
  dark: {
    text: { l: 80, c: 80 },
    solid: { l: 55, c: 72 },
    warningSolid: { l: 58, c: 80 },
    subtle: { l: 30, c: 50, a: 0.24 },
    subtleText: { l: 80, c: 55 },
    border: { l: 70, c: 60, a: 0.32 },
  },
} as const;

const lch = (l: number, c: number, h: number, a?: number): string =>
  toCss('LCH', a === undefined ? [l, c, h] : [l, c, h, a]);

/** One intent's set: `--{i}` the hue for text and icons, `-solid` and `-subtle` fills with their text, `-border`. */
function intentVars(
  intent: 'info' | 'success' | 'warning' | 'destructive',
  hue: number,
  isDark: boolean,
): Record<string, string> {
  const step = INTENT_STEP[isDark ? 'dark' : 'light'];
  const solid = intent === 'warning' ? step.warningSolid : step.solid;
  return {
    [`--${intent}`]: lch(step.text.l, step.text.c, hue),
    [`--${intent}-solid`]: lch(solid.l, solid.c, hue),
    [`--${intent}-solid-foreground`]: lch(100, 0, 0),
    [`--${intent}-subtle`]: lch(step.subtle.l, step.subtle.c, hue, step.subtle.a),
    [`--${intent}-subtle-foreground`]: lch(step.subtleText.l, step.subtleText.c, hue),
    [`--${intent}-border`]: lch(step.border.l, step.border.c, hue, step.border.a),
  };
}

/**
 * The categorical set, `--category-1` … `--category-8`: eight hues for things told apart, not ranked (labels, file types,
 * an organization's categories). Static like the charts, not branded. Neighbours sit far apart on the hue wheel, so the
 * first picks already differ; lightness and chroma per hue, so each reads at the same weight (yellow and green sit
 * lighter than blue and violet). Text on one takes `Badge color`, which derives it; the bare token is a dot or swatch.
 */
const CATEGORY = {
  light: [
    { h: 270, l: 58, c: 62 },
    { h: 60, l: 68, c: 80 },
    { h: 190, l: 62, c: 44 },
    { h: 350, l: 60, c: 66 },
    { h: 135, l: 64, c: 58 },
    { h: 305, l: 56, c: 62 },
    { h: 95, l: 76, c: 72 },
    { h: 35, l: 58, c: 74 },
  ],
  dark: [
    { h: 270, l: 68, c: 62 },
    { h: 60, l: 74, c: 78 },
    { h: 190, l: 70, c: 44 },
    { h: 350, l: 68, c: 62 },
    { h: 135, l: 72, c: 56 },
    { h: 305, l: 66, c: 60 },
    { h: 95, l: 80, c: 70 },
    { h: 35, l: 66, c: 70 },
  ],
} as const;

function categoryVars(isDark: boolean): Record<string, string> {
  return Object.fromEntries(
    CATEGORY[isDark ? 'dark' : 'light'].map(({ h, l, c }, index) => [`--category-${index + 1}`, lch(l, c, h)]),
  );
}

/** The brand intent: the shared set on the brand's hue. `--primary` (text and icons) and the solid are the brand color. */
function primaryVars(theme: Theme): Record<string, string> {
  const { color } = theme;
  const brand = fromCss(color.controlPrimary);
  const { subtle, subtleText, border } = INTENT_STEP[theme.isDark ? 'dark' : 'light'];
  return {
    '--primary': color.controlPrimary,
    '--primary-solid': color.controlPrimary,
    '--primary-solid-foreground': color.controlPrimaryLabel,
    '--primary-subtle': lch(subtle.l, Math.min(subtle.c, brand[1]), brand[2], subtle.a),
    '--primary-subtle-foreground': lch(subtleText.l, Math.min(subtleText.c, brand[1]), brand[2]),
    '--primary-border': lch(border.l, Math.min(border.c, brand[1]), brand[2], border.a),
  };
}

/**
 * Text below `--foreground` on a surface: `--muted-foreground`, then `--faint-foreground` (placeholders, shortcuts,
 * tertiary meta) and `--disabled-foreground`, each a mix of muted text toward the surface.
 */
function textLevelVars(theme: Theme): Record<string, string> {
  const { color } = theme;
  const muted = fromCss(color.labelMuted);
  const base = fromCss(color.bgBase);
  const toward = (amount: number): Color => mix(muted, base, amount);
  return {
    '--muted-foreground': color.labelMuted,
    '--faint-foreground': toCss(theme.colorFormat, toward(0.3)),
    '--disabled-foreground': toCss(theme.colorFormat, toward(0.5)),
  };
}

/**
 * The inverted surface (`[data-surface=inverse]`): the other mode's page tokens, with its popup as the surface, so a
 * floating control reads dark on a light page and light on a dark one, and what sits on it keeps its contrast. `theme`
 * is the mode the surface shows: the light page theme for `.dark`, the dark one otherwise.
 */
export function inverseSurfaceVars(theme: Theme, tint: FillTint, destructive: Color): Record<string, string> {
  const { popup, popupCard } = surfaceThemes(theme);
  return {
    ...themeToCssVars(theme, tint, destructive),
    ...surfaceVars(popup, tint),
    '--card': popupCard.color.bgBase,
  };
}

/**
 * One rule per nested surface. Inside a popup, `--card` moves up with it so a card in a popup sits above it. A card on
 * a card sets its own `--card`, since `bg-card` resolves on the card itself; the popup rules come after, so a card in a
 * popup keeps the popup's steps.
 */
export function surfaceRules(
  page: Theme,
  tint: FillTint,
): ReadonlyArray<{ selector: string; vars: Record<string, string> }> {
  const { card, cardCard, popup, popupCard } = surfaceThemes(page);
  return [
    { selector: '[data-surface=card]', vars: surfaceVars(card, tint) },
    {
      selector: '[data-surface=card] [data-surface=card]',
      vars: { ...surfaceVars(cardCard, tint), '--card': cardCard.color.bgBase },
    },
    { selector: '[data-surface=popup]', vars: { ...surfaceVars(popup, tint), '--card': popupCard.color.bgBase } },
    { selector: '[data-surface=popup] [data-surface=card]', vars: surfaceVars(popupCard, tint) },
  ];
}
