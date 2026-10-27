/**
 * Sizing themes (DESIGN.md, Sizing): two axes, density and radius, each a partial map of token → CSS value, and named
 * styles that combine them. `sizingThemeCss` renders a theme's overrides for `:root` or a subtree: every token in
 * `tailwind.css` is a literal, so re-declaring one on an element changes exactly that token below it.
 */

/** The families of `tailwind.css`'s Sizing section and Component sizing block, then the radius and type roles. */
export const SIZING_GROUPS = {
  spacing: 'Spacing roles',
  controls: 'Controls',
  fields: 'Fields',
  rows: 'Rows',
  surfaces: 'Surfaces',
  marks: 'Marks',
  radius: 'Radius',
  type: 'Type',
} as const;

export type SizingGroup = keyof typeof SIZING_GROUPS;

/** A sizing token: its default (px, as in `tailwind.css`), its family, and what it tunes. */
export interface SizingTokenSpec {
  readonly value: string;
  readonly group: SizingGroup;
  readonly tunes: string;
}

const t = (group: SizingGroup, value: string, tunes: string): SizingTokenSpec => ({ group, value, tunes });

/**
 * Every token a sizing theme may set, in `tailwind.css` order: the `@theme` Sizing section, the radius and type roles,
 * and the Component sizing block. A new density sets any of them (`DENSITIES`, `scaleDensity`); `scripts/check-sizing.mjs`
 * keeps this list and `tailwind.css` in step.
 */
export const SIZING_TOKENS = {
  // Spacing roles.
  '--spacing-tight': t('spacing', '4px', 'A title and its description; chips apart'),
  '--spacing-related': t('spacing', '8px', 'Label to control, a field’s addons, OTP slots, swatches, week rows'),
  '--spacing-part': t(
    'spacing',
    '12px',
    'Parts of one component: media to text, text to action, label beside control, toasts apart',
  ),
  '--spacing-group': t('spacing', '16px', 'Peer blocks; a heading and its content; calendar header, timeline'),
  '--spacing-card': t('spacing', '20px', 'A card’s padding, and its header, footer and flush rows'),
  '--spacing-page': t('spacing', '32px', 'Page header to content (layout: no density moves it)'),
  '--spacing-section': t('spacing', '48px', 'Section to section (layout: no density moves it)'),
  // Controls.
  '--spacing-control-2xs': t('controls', '20px', 'Kbd height'),
  '--spacing-control-xs': t('controls', '24px', 'Button xs, buttons and chips inside a field'),
  '--spacing-control-sm': t('controls', '32px', 'Button sm, tabs, sidebar rows'),
  '--spacing-control': t('controls', '36px', 'Button, fields, calendar day: the main control height'),
  '--spacing-control-lg': t('controls', '40px', 'Button lg, OTP slot'),
  '--spacing-control-pad-xs': t('controls', '8px', 'Inline padding of xs buttons'),
  '--spacing-control-pad-sm': t('controls', '12px', 'Inline padding of small buttons and tabs'),
  '--spacing-control-pad': t('controls', '16px', 'Inline padding of buttons and toggles'),
  '--spacing-control-gap-sm': t('controls', '4px', 'Icon to label in small controls'),
  '--spacing-control-gap': t('controls', '6px', 'Icon to label in a control'),
  '--spacing-icon-xs': t('controls', '12px', 'Icons in badges sm and tiny controls'),
  '--spacing-icon-sm': t('controls', '14px', 'Icons in small controls and badges'),
  '--spacing-icon': t('controls', '16px', 'Icons in controls, rows and menus'),
  '--spacing-icon-lg': t('controls', '20px', 'Large icons: empty and alert media'),
  // Fields.
  '--spacing-field-pad': t('fields', '12px', 'Text inset in inputs, selects, textareas (less the border)'),
  '--spacing-field-pad-y': t('fields', '8px', 'Block padding of a multi-line field'),
  // Rows.
  '--spacing-menu-item': t('rows', '36px', 'Menu, select and combobox row height'),
  '--spacing-menu-item-pad': t('rows', '10px', 'Menu, select and combobox row inline padding'),
  '--spacing-row-pad-x': t('rows', '12px', 'Item, table cell and flush accordion inline padding'),
  '--spacing-row-pad-y': t('rows', '10px', 'Item, table cell and flush accordion block padding'),
  '--spacing-row-gap': t('rows', '8px', 'Icon to label in any row: menus, command, sidebar, toast'),
  // Surfaces.
  '--spacing-modal': t('surfaces', '24px', 'Dialog and sheet padding'),
  '--spacing-popup': t('surfaces', '10px', 'Popover padding'),
  '--spacing-picker': t('surfaces', '12px', 'Calendar and color picker padding'),
  '--spacing-popup-inset': t('surfaces', '4px', 'Menu and select popup edge to its rows'),
  '--spacing-card-inset': t('surfaces', '4px', 'Card shell edge to its content'),
  '--spacing-list-inset': t('surfaces', '8px', 'Sidebar, bottom nav panel and command list edge to rows'),
  // Marks.
  '--spacing-track': t('marks', '4px', 'Slider and progress track thickness'),
  // Radius roles.
  '--radius-control-xs': t('radius', '4px', 'Kbd and controls 16–20px'),
  '--radius-control-sm': t('radius', '8px', 'Badges and controls 20–28px'),
  '--radius-control': t('radius', '10px', 'Buttons, single-line fields, tabs'),
  '--radius-control-lg': t('radius', '12px', 'Button lg'),
  '--radius-popup': t('radius', '16px', 'Menus, popovers, selects'),
  '--radius-card': t('radius', '20px', 'Card shell'),
  '--radius-dialog': t('radius', '20px', 'Dialogs and sheets'),
  '--radius-panel': t('radius', '20px', 'The page panel'),
  '--radius-checkbox': t('radius', '4px', 'Checkbox box (never a pill)'),
  '--radius-tooltip': t('radius', '8px', 'Tooltips, chart tooltip'),
  '--radius-area': t('radius', '10px', 'Multi-line fields: textarea, drop zone, wrapping input group'),
  '--radius-block': t('radius', '12px', 'Rows and blocks: item, choice card, prose pre and img'),
  '--radius-track': t('radius', '9999px', 'Switch, slider and progress tracks and thumbs'),
  '--radius-xs': t('radius', '2px', 'Fixed step (square avatars)'),
  '--radius-sm': t('radius', '4px', 'Fixed step'),
  '--radius-md': t('radius', '6px', 'Fixed step'),
  '--radius-lg': t('radius', '8px', 'Fixed step'),
  '--radius-xl': t('radius', '10px', 'Fixed step'),
  '--radius-2xl': t('radius', '12px', 'Fixed step'),
  '--radius-3xl': t('radius', '16px', 'Fixed step'),
  '--radius-4xl': t('radius', '20px', 'Fixed step'),
  '--radius-5xl': t('radius', '24px', 'Fixed step'),
  // Type roles.
  '--text-title': t('type', '28px', 'Page title, big numbers'),
  '--text-title--line-height': t('type', '36px', 'Title line height'),
  '--text-heading': t('type', '18px', 'Section, dialog, sheet and empty titles'),
  '--text-heading--line-height': t('type', '24px', 'Heading line height'),
  '--text-body': t('type', '14px', 'Reading text, descriptions, row titles'),
  '--text-body--line-height': t('type', '21px', 'Body line height'),
  '--text-control': t('type', '14px', 'Buttons, fields, menus, tabs, tables'),
  '--text-control--line-height': t('type', '20px', 'Control line height: menu rows center on it'),
  '--text-caption': t('type', '12px', 'Meta, badges, tooltips'),
  '--text-caption--line-height': t('type', '16px', 'Caption line height'),
  // Component sizing: controls.
  '--badge-height': t('controls', '24px', 'Badge height'),
  '--badge-height-sm': t('controls', '20px', 'Badge sm height'),
  '--badge-pad-x': t('controls', '8px', 'Badge inline padding'),
  '--badge-pad-x-sm': t('controls', '6px', 'Badge sm inline padding'),
  '--kbd-pad-x': t('controls', '4px', 'Kbd inline padding'),
  '--tabs-radius': t('controls', '10px', 'Segmented tab and its sliding chip; the track radius follows'),
  '--tabs-inset': t('controls', '4px', 'Segmented track padding around the tabs'),
  '--action-bar-status-pad-x': t('controls', '10px', 'Action bar status inline padding'),
  // Component sizing: fields.
  '--field-chip-pad-x': t('fields', '8px', 'Chips and raised buttons in a field: file button, combobox chip'),
  '--field-button-pad-x': t('fields', '6px', 'Ghost xs button in a field'),
  '--textarea-min-height': t('fields', '60px', 'Textarea least height'),
  '--file-drop-zone-pad-x': t('fields', '24px', 'File drop zone inline padding'),
  '--file-drop-zone-pad-y': t('fields', '28px', 'File drop zone block padding'),
  '--file-drop-zone-sm-pad-x': t('fields', '14px', 'File drop zone sm inline padding'),
  '--file-drop-zone-sm-pad-y': t('fields', '8px', 'File drop zone sm block padding'),
  '--color-picker-row-gap': t('fields', '10px', 'Color picker custom area row gap'),
  '--color-picker-hue': t('fields', '12px', 'Color picker hue bar thickness'),
  // Component sizing: rows.
  '--item-gap': t('rows', '10px', 'Item media, content and actions apart'),
  '--sidebar-label-pad-x': t('rows', '8px', 'Sidebar group label inline padding'),
  '--sidebar-sub-height': t('rows', '28px', 'Sidebar sub-menu row height'),
  '--sidebar-sub-pad-y': t('rows', '6px', 'Sidebar sub-menu block padding'),
  '--bottom-nav-gap': t('rows', '10px', 'Bottom nav "More" row icon to label'),
  '--bottom-nav-tab-width': t('rows', '88px', 'Bottom nav labelled tab width'),
  '--bottom-nav-tab-height': t('rows', '52px', 'Bottom nav labelled tab height'),
  '--bottom-nav-action-height': t('rows', '44px', 'Bottom nav labelled: docked action bar button height'),
  '--accordion-pad': t('rows', '8px', 'Accordion trigger padding'),
  '--accordion-content-pad-end': t('rows', '40px', 'Accordion content end padding'),
  '--accordion-flush-content-pad-bottom': t('rows', '12px', 'Flush accordion content bottom padding'),
  '--table-head-height': t('rows', '40px', 'Table head row height'),
  '--table-foot-pad-y': t('rows', '12px', 'Table card footer cell block padding'),
  '--table-sort-pad-x': t('rows', '8px', 'Table sort button inline padding'),
  '--table-sort-pad-y': t('rows', '4px', 'Table sort button block padding'),
  '--table-group-height': t('rows', '36px', 'Table group band height'),
  '--command-input-height': t('rows', '48px', 'Command search row height'),
  '--command-input-gap': t('rows', '10px', 'Command search icon to text'),
  '--command-heading-pad-y': t('rows', '6px', 'Command group heading block padding'),
  '--command-empty-pad-y': t('rows', '24px', 'Command empty note block padding'),
  '--command-footer-height': t('rows', '44px', 'Command footer height'),
  // Component sizing: surfaces.
  '--alert-pad-x': t('surfaces', '20px', 'Alert inline padding'),
  '--alert-pad-y': t('surfaces', '10px', 'Alert block padding; stacked text to action'),
  '--alert-radius': t('surfaces', '20px', 'Alert radius'),
  '--alert-action-inset': t('surfaces', '6px', 'Alert action inset from the corner'),
  '--alert-dialog-icon': t('surfaces', '24px', 'Alert dialog media icon'),
  '--drawer-radius': t('surfaces', '32px', 'Drawer radius'),
  '--drawer-inset': t('surfaces', '8px', 'Drawer inset from the screen edge'),
  '--drawer-page-pad': t('surfaces', '10px', 'Drawer page padding and block gap'),
  '--drawer-grabber-width': t('surfaces', '36px', 'Drawer grabber width'),
  '--drawer-grabber-height': t('surfaces', '4px', 'Drawer grabber height'),
  '--drawer-menu-item-height': t('surfaces', '48px', 'Drawer menu row height'),
  '--drawer-menu-item-radius': t('surfaces', '14px', 'Drawer menu row radius'),
  '--drawer-menu-item-pad-x': t('surfaces', '14px', 'Drawer menu row padding and icon gap'),
  '--drawer-option-radius': t('surfaces', '16px', 'Drawer option row radius'),
  '--drawer-text': t('surfaces', '16px', 'Drawer row and page title text'),
  '--drawer-text-leading': t('surfaces', '24px', 'Drawer row and page title line height'),
  '--tooltip-pad-x': t('surfaces', '8px', 'Tooltip and anchored toast inline padding'),
  '--tooltip-pad-y': t('surfaces', '4px', 'Tooltip and anchored toast block padding'),
  '--chart-tooltip-pad-x': t('surfaces', '10px', 'Chart tooltip inline padding'),
  '--chart-tooltip-pad-y': t('surfaces', '6px', 'Chart tooltip block padding, rows apart'),
  '--toast-pad-x': t('surfaces', '14px', 'Toast inline padding'),
  '--toast-pad-y': t('surfaces', '12px', 'Toast block padding'),
  '--toast-peek': t('surfaces', '12px', 'How far a stacked toast peeks out'),
  '--empty-pad-x': t('surfaces', '24px', 'Empty state inline padding'),
  '--empty-pad-y': t('surfaces', '40px', 'Empty state block padding'),
  '--empty-pad-x-sm': t('surfaces', '16px', 'Empty sm inline padding'),
  '--empty-pad-y-sm': t('surfaces', '24px', 'Empty sm block padding'),
  '--prose-code-pad-x': t('surfaces', '4px', 'Prose inline code inline padding'),
  '--prose-code-pad-y': t('surfaces', '2px', 'Prose inline code block padding'),
  '--prose-pre-pad': t('surfaces', '12px', 'Prose code block padding'),
  // Component sizing: marks.
  '--checkbox-size': t('marks', '16px', 'Checkbox and radio box'),
  '--radio-dot-size': t('marks', '6px', 'Radio dot'),
  '--choice-card-height': t('marks', '48px', 'Choice card least height'),
  '--choice-card-pad-y': t('marks', '12px', 'Choice card block padding'),
  '--switch-width': t('marks', '36px', 'Switch track width'),
  '--switch-width-sm': t('marks', '28px', 'Switch sm track width'),
  '--switch-thumb': t('marks', '16px', 'Switch thumb'),
  '--switch-thumb-sm': t('marks', '12px', 'Switch sm thumb'),
  '--switch-inset': t('marks', '2px', 'Switch track padding around the thumb'),
  '--slider-thumb': t('marks', '12px', 'Slider thumb'),
  '--stepper-indicator-size': t('marks', '20px', 'Stepper numbered indicator'),
  '--timeline-marker-size': t('marks', '16px', 'Timeline marker'),
  '--timeline-step': t('marks', '48px', 'Timeline distance to the next event'),
  '--timeline-step-x': t('marks', '32px', 'Horizontal timeline distance to the next event'),
} as const satisfies Record<`--${string}`, SizingTokenSpec>;

export type SizingToken = keyof typeof SIZING_TOKENS;

/** The token names, in `SIZING_TOKENS` order. */
export const SIZING_TOKEN_NAMES = Object.keys(SIZING_TOKENS) as ReadonlyArray<SizingToken>;

/** Every token at its default, as in `tailwind.css`. */
export const DEFAULT_SIZING = Object.fromEntries(
  Object.entries(SIZING_TOKENS).map(([token, spec]) => [token, spec.value]),
) as Readonly<Record<SizingToken, string>>;

/** Some tokens, each a literal CSS value (`'32px'`), never a `var()`. */
export type SizingValues = Readonly<Partial<Record<SizingToken, string>>>;

/** How much room controls, rows and surfaces take. Type and layout widths stay. */
export const DENSITIES = {
  compact: {
    '--spacing-control-2xs': '18px',
    '--spacing-control-xs': '20px',
    '--spacing-control-sm': '28px',
    '--spacing-control': '32px',
    '--spacing-control-lg': '36px',
    '--spacing-menu-item': '32px',
    '--spacing-control-pad-xs': '6px',
    '--spacing-control-pad-sm': '10px',
    '--spacing-control-pad': '12px',
    '--spacing-field-pad': '10px',
    '--spacing-menu-item-pad': '8px',
    '--spacing-row-pad-x': '10px',
    '--spacing-row-pad-y': '8px',
    '--spacing-modal': '20px',
    '--spacing-group': '12px',
    '--spacing-card': '16px',
    '--badge-pad-x': '6px',
    '--badge-height': '20px',
    '--badge-height-sm': '18px',
    '--badge-pad-x-sm': '4px',
    '--sidebar-sub-height': '24px',
    '--stepper-indicator-size': '18px',
    '--spacing-part': '10px',
    '--field-chip-pad-x': '6px',
    '--field-button-pad-x': '4px',
    '--textarea-min-height': '52px',
    '--spacing-field-pad-y': '6px',
    '--file-drop-zone-pad-x': '20px',
    '--file-drop-zone-pad-y': '24px',
    '--spacing-picker': '10px',
    '--choice-card-height': '44px',
    '--choice-card-pad-y': '10px',
    '--switch-thumb': '14px',
    '--switch-thumb-sm': '10px',
    '--switch-width': '32px',
    '--switch-width-sm': '24px',
    '--item-gap': '8px',
    '--alert-pad-x': '16px',
    '--alert-pad-y': '8px',
    '--table-foot-pad-y': '10px',
    '--table-head-height': '36px',
    '--table-group-height': '32px',
    '--spacing-popup': '8px',
    '--spacing-list-inset': '6px',
    '--command-input-height': '44px',
    '--command-footer-height': '40px',
    '--toast-pad-x': '12px',
    '--toast-pad-y': '10px',
    '--empty-pad-x': '20px',
    '--empty-pad-y': '32px',
    '--empty-pad-x-sm': '12px',
    '--empty-pad-y-sm': '20px',
    '--prose-pre-pad': '10px',
  },
  default: {},
  comfortable: {
    '--spacing-control-2xs': '22px',
    '--spacing-control-xs': '28px',
    '--spacing-control-sm': '36px',
    '--spacing-control': '40px',
    '--spacing-control-lg': '44px',
    '--spacing-menu-item': '40px',
    '--spacing-control-pad-xs': '10px',
    '--spacing-control-pad-sm': '14px',
    '--spacing-control-pad': '18px',
    '--spacing-field-pad': '14px',
    '--spacing-menu-item-pad': '12px',
    '--spacing-row-pad-x': '14px',
    '--spacing-row-pad-y': '12px',
    '--spacing-control-gap-sm': '6px',
    '--spacing-control-gap': '8px',
    '--spacing-icon-xs': '14px',
    '--spacing-icon-sm': '16px',
    '--spacing-icon': '18px',
    '--spacing-popup-inset': '6px',
    '--spacing-modal': '28px',
    '--spacing-group': '20px',
    '--spacing-card': '24px',
    '--badge-pad-x': '10px',
    '--badge-height': '28px',
    '--badge-height-sm': '22px',
    '--badge-pad-x-sm': '8px',
    '--kbd-pad-x': '6px',
    '--sidebar-sub-height': '32px',
    '--stepper-indicator-size': '24px',
    '--spacing-part': '14px',
    '--field-chip-pad-x': '10px',
    '--field-button-pad-x': '8px',
    '--textarea-min-height': '72px',
    '--spacing-field-pad-y': '10px',
    '--file-drop-zone-pad-x': '28px',
    '--file-drop-zone-pad-y': '32px',
    '--spacing-picker': '14px',
    '--choice-card-height': '52px',
    '--choice-card-pad-y': '14px',
    '--checkbox-size': '18px',
    '--radio-dot-size': '8px',
    '--switch-thumb': '18px',
    '--switch-thumb-sm': '14px',
    '--switch-width': '40px',
    '--switch-width-sm': '32px',
    '--slider-thumb': '16px',
    '--spacing-row-gap': '10px',
    '--item-gap': '12px',
    '--alert-pad-x': '24px',
    '--alert-pad-y': '12px',
    '--table-foot-pad-y': '14px',
    '--table-head-height': '44px',
    '--table-group-height': '40px',
    '--spacing-popup': '12px',
    '--tooltip-pad-x': '10px',
    '--tooltip-pad-y': '6px',
    '--command-input-height': '52px',
    '--command-footer-height': '48px',
    '--toast-pad-x': '16px',
    '--toast-pad-y': '14px',
    '--empty-pad-x': '28px',
    '--empty-pad-y': '48px',
    '--prose-pre-pad': '14px',
  },
} as const satisfies Record<string, SizingValues>;

export type Density = keyof typeof DENSITIES;

/** Layout spacing: page rhythm, not density. */
const UNSCALED: ReadonlySet<SizingToken> = new Set(['--spacing-page', '--spacing-section']);

/** Heights snap to the 4px grid: the control scale, menu rows and every `-height` token (not line heights). */
const isHeight = (token: SizingToken) =>
  /^--spacing-control(-2xs|-xs|-sm|-lg)?$|^--spacing-menu-item$|-height$/.test(token) &&
  !token.includes('--line-height');

/**
 * A density of your own: every default length times `factor`, rounded to whole px. Heights (the control scale,
 * menu rows, every `-height` token) snap to the 4px grid instead, so ×1.125 gives 40px controls, not 41. Radius, `page`
 * and `section` spacing never scale; type scales only with `type: true` (sizes and line heights, whole px). A small
 * value (4px or less: an inset, a gap, a hairline-ish padding) moves at most 1px and never below 1px, so a switch keeps
 * its 2px inset at 0.8 and 1.2. Only tokens that differ from the default are returned; `scaleDensity(1)` is `{}`.
 */
export function scaleDensity(factor: number, options: { readonly type?: boolean } = {}): SizingValues {
  const values: Partial<Record<SizingToken, string>> = {};
  for (const token of SIZING_TOKEN_NAMES) {
    const { group, value } = SIZING_TOKENS[token];
    if (group === 'radius' || UNSCALED.has(token) || (group === 'type' && options.type !== true)) continue;
    const px = Number.parseFloat(value);
    const scaled = isHeight(token) ? Math.round((px * factor) / 4) * 4 : Math.round(px * factor);
    const next = px <= 4 ? Math.min(px + 1, Math.max(px - 1, 1, scaled)) : Math.max(1, scaled);
    if (next !== px) values[token] = `${next}px`;
  }
  return values;
}

/**
 * How round. `pill` rounds single-line controls fully; surfaces, multi-line fields, blocks, tooltips and the checkbox
 * cap. `sharp` squares everything, the fixed steps too; a checkbox and a track keep a hint of a corner.
 */
export const RADII = {
  sharp: {
    '--radius-control-xs': '0px',
    '--radius-control-sm': '0px',
    '--radius-control': '0px',
    '--radius-control-lg': '0px',
    '--radius-popup': '0px',
    '--radius-card': '0px',
    '--radius-dialog': '0px',
    '--radius-panel': '0px',
    '--radius-checkbox': '2px',
    '--radius-tooltip': '0px',
    '--radius-area': '0px',
    '--radius-block': '0px',
    '--tabs-radius': '0px',
    '--alert-radius': '0px',
    '--radius-track': '2px',
    '--radius-xs': '0px',
    '--radius-sm': '0px',
    '--radius-md': '0px',
    '--radius-lg': '0px',
    '--radius-xl': '0px',
    '--radius-2xl': '0px',
    '--radius-3xl': '0px',
    '--radius-4xl': '0px',
    '--radius-5xl': '0px',
  },
  default: {},
  soft: {
    '--radius-control-xs': '5px',
    '--radius-control-sm': '10px',
    '--radius-control': '12px',
    '--radius-control-lg': '14px',
    '--radius-popup': '20px',
    '--radius-card': '24px',
    '--radius-dialog': '24px',
    '--radius-panel': '24px',
    '--radius-checkbox': '5px',
    '--radius-tooltip': '10px',
    '--radius-area': '12px',
    '--radius-block': '14px',
    '--tabs-radius': '12px',
    '--alert-radius': '24px',
  },
  pill: {
    '--radius-control-xs': '9999px',
    '--radius-control-sm': '9999px',
    '--radius-control': '9999px',
    '--radius-control-lg': '9999px',
    '--radius-popup': '20px',
    '--radius-card': '24px',
    '--radius-dialog': '24px',
    '--radius-panel': '24px',
    '--radius-checkbox': '6px',
    '--radius-tooltip': '12px',
    '--radius-area': '16px',
    '--radius-block': '16px',
    '--tabs-radius': '9999px',
    '--alert-radius': '24px',
  },
} as const satisfies Record<string, SizingValues>;

export type Radius = keyof typeof RADII;

/**
 * A sizing theme: a density and a radius, then its own `tokens` on top. `touch` applies below `sm` (640px), on top of
 * the rest: a phone gets bigger targets than a desktop.
 */
export interface SizingTheme {
  /** A named density, or one of your own (`scaleDensity(0.9)`, or any `SizingValues`). */
  readonly density: Density | SizingValues;
  readonly radius: Radius;
  readonly tokens?: SizingValues;
  readonly touch?: SizingValues;
}

export const SIZING_STYLES = {
  /** The design system's own: `tailwind.css` as is. */
  triargos: { density: 'default', radius: 'default' },
  /**
   * coss ui (coss.com/ui): 32px controls and 28px menu rows on a desktop, one step bigger on a phone; 10px controls and
   * popups, 8px tabs, 18px cards and dialogs, 16px popover padding; badge, switch, slider, checkbox and alert as coss.
   * Control text stays 14 on a phone (tables read it; fields go 16 there anyway).
   */
  coss: {
    density: 'compact',
    radius: 'default',
    tokens: {
      '--spacing-control-2xs': '20px',
      '--spacing-field-pad': '12px',
      '--spacing-control-gap': '8px',
      '--spacing-modal': '24px',
      '--spacing-group': '16px',
      '--spacing-card': '24px',
      '--radius-control-sm': '6px',
      '--radius-control-lg': '10px',
      '--radius-popup': '10px',
      '--radius-card': '18px',
      '--radius-dialog': '18px',
      '--radius-panel': '14px',
      '--radius-block': '10px',
      '--spacing-menu-item': '28px',
      '--badge-height': '18px',
      '--badge-height-sm': '16px',
      '--tabs-radius': '8px',
      '--switch-width': '30px',
      '--switch-width-sm': '22px',
      '--alert-pad-x': '14px',
      '--alert-pad-y': '12px',
      '--alert-radius': '14px',
      '--table-head-height': '40px',
      '--badge-pad-x': '4px',
      '--tabs-inset': '2px',
      '--textarea-min-height': '72px',
      '--switch-thumb': '16px',
      '--switch-thumb-sm': '12px',
      '--switch-inset': '1px',
      '--slider-thumb': '16px',
      '--spacing-part': '8px',
      '--spacing-popup': '16px',
      '--toast-pad-x': '14px',
      '--toast-pad-y': '12px',
    },
    touch: {
      '--spacing-control-xs': '24px',
      '--spacing-control-sm': '32px',
      '--spacing-control': '36px',
      '--spacing-control-lg': '40px',
      '--spacing-menu-item': '32px',
      '--badge-height': '22px',
      '--badge-height-sm': '20px',
      '--spacing-icon-xs': '14px',
      '--spacing-icon-sm': '16px',
      '--spacing-icon': '18px',
      '--checkbox-size': '18px',
      '--radio-dot-size': '8px',
      '--switch-thumb': '20px',
      '--switch-thumb-sm': '16px',
      '--switch-width': '38px',
      '--switch-width-sm': '30px',
      '--slider-thumb': '20px',
      '--textarea-min-height': '84px',
      '--table-group-height': '40px',
    },
  },
  /** shadcn mira and nova: 28px controls, 13px control text, tighter cards and smaller corners. */
  dense: {
    density: 'compact',
    radius: 'default',
    tokens: {
      '--spacing-control-2xs': '16px',
      '--spacing-control-sm': '24px',
      '--spacing-control': '28px',
      '--spacing-control-lg': '32px',
      '--spacing-menu-item': '28px',
      '--spacing-control-pad-xs': '6px',
      '--spacing-control-pad-sm': '8px',
      '--spacing-control-pad': '10px',
      '--spacing-field-pad': '8px',
      '--spacing-row-pad-y': '6px',
      '--spacing-control-gap': '4px',
      '--spacing-icon-xs': '10px',
      '--spacing-icon-sm': '12px',
      '--spacing-icon': '14px',
      '--spacing-icon-lg': '16px',
      '--spacing-modal': '16px',
      '--spacing-card': '12px',
      '--text-control': '13px',
      '--text-control--line-height': '18px',
      '--radius-control-sm': '6px',
      '--radius-control': '8px',
      '--radius-control-lg': '8px',
      '--radius-popup': '10px',
      '--radius-card': '12px',
      '--radius-dialog': '14px',
      '--radius-panel': '12px',
      '--radius-tooltip': '6px',
      '--radius-area': '8px',
      '--radius-block': '8px',
      '--tabs-radius': '8px',
      '--alert-radius': '12px',
      '--badge-pad-x': '4px',
      '--badge-height-sm': '16px',
      '--kbd-pad-x': '3px',
      '--tabs-inset': '2px',
      '--stepper-indicator-size': '16px',
      '--spacing-part': '8px',
      '--textarea-min-height': '48px',
      '--spacing-field-pad-y': '4px',
      '--file-drop-zone-pad-x': '16px',
      '--file-drop-zone-pad-y': '20px',
      '--choice-card-height': '40px',
      '--choice-card-pad-y': '8px',
      '--checkbox-size': '14px',
      '--switch-thumb': '12px',
      '--switch-width': '28px',
      '--spacing-row-gap': '6px',
      '--alert-pad-x': '12px',
      '--alert-pad-y': '6px',
      '--table-foot-pad-y': '8px',
      '--table-head-height': '32px',
      '--table-group-height': '32px',
      '--tooltip-pad-x': '6px',
      '--tooltip-pad-y': '2px',
      '--command-input-height': '40px',
      '--command-footer-height': '36px',
      '--toast-pad-y': '8px',
      '--empty-pad-x': '16px',
      '--empty-pad-y': '24px',
      '--empty-pad-y-sm': '16px',
      '--prose-pre-pad': '8px',
    },
    touch: {
      '--spacing-control-2xs': '18px',
      '--spacing-control-xs': '20px',
      '--spacing-control-sm': '28px',
      '--spacing-control': '32px',
      '--spacing-control-lg': '36px',
      '--spacing-menu-item': '32px',
      '--spacing-field-pad': '10px',
      '--spacing-icon-sm': '14px',
      '--spacing-icon': '16px',
      '--text-control': '14px',
      '--text-control--line-height': '20px',
      '--checkbox-size': '16px',
      '--switch-thumb': '14px',
      '--switch-width': '32px',
      '--table-group-height': '40px',
    },
  },
  /** shadcn maia: roomy controls, pill-shaped, on rounder surfaces. */
  soft: {
    density: 'comfortable',
    radius: 'pill',
    tokens: {
      '--radius-popup': '24px',
      '--radius-card': '28px',
      '--radius-dialog': '28px',
      '--radius-panel': '28px',
      '--alert-radius': '28px',
    },
  },
} as const satisfies Record<string, SizingTheme>;

export type SizingStyle = keyof typeof SIZING_STYLES;

export const DEFAULT_SIZING_THEME: SizingTheme = SIZING_STYLES.triargos;

/** A theme's overrides: density, then radius, then its own tokens; `touch` separately. */
export function sizingValues(theme: SizingTheme): { readonly base: SizingValues; readonly touch: SizingValues } {
  return {
    base: {
      ...(typeof theme.density === 'string' ? DENSITIES[theme.density] : theme.density),
      ...RADII[theme.radius],
      ...theme.tokens,
    },
    touch: { ...theme.touch },
  };
}

const declarations = (values: SizingValues): string =>
  Object.entries(values)
    .map(([token, value]) => `${token}:${value};`)
    .join('');

/**
 * The CSS for a sizing theme: only what it overrides, on `selector` (`:root`, or a subtree such as
 * `[data-sizing=dense]`), and its `touch` values below `sm`. Empty for the default theme. Render it into a `<style>`
 * after `tailwind.css`.
 */
export function sizingThemeCss(theme: SizingTheme, selector = ':root'): string {
  const { base, touch } = sizingValues(theme);
  const rules: Array<string> = [];
  if (Object.keys(base).length > 0) rules.push(`${selector}{${declarations(base)}}`);
  if (Object.keys(touch).length > 0) rules.push(`@media (width < 40rem){${selector}{${declarations(touch)}}}`);
  return rules.join('\n');
}
