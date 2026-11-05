/**
 * The sizing tokens (DESIGN.md, Sizing): every length `tailwind.css` declares, with its default and what it tunes. One
 * design, no themes: the values live in `tailwind.css`; an app that needs a different length re-declares that one CSS
 * variable on `:root` or a subtree. The docs read this list for the token reference and the Customize sliders;
 * `scripts/check-sizing.mjs` keeps it and `tailwind.css` in step.
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
 * Every sizing token, in `tailwind.css` order: the `@theme` Sizing section, the radius and type roles, and the
 * Component sizing block.
 */
export const SIZING_TOKENS = {
  // Spacing roles.
  '--spacing-tight': t('spacing', '4px', 'A title and its description; chips apart'),
  '--spacing-related': t(
    'spacing',
    '8px',
    'Items that touch: label to control, media to text, text to its action, a field’s addons, OTP slots',
  ),
  '--spacing-group': t(
    'spacing',
    '16px',
    'Peer blocks; a heading and its content; a label beside its control; a chart and its legend; toasts apart',
  ),
  '--spacing-card': t('spacing', '16px', 'A card’s padding, and its header, footer and flush rows'),
  '--spacing-page': t('spacing', '48px', 'Page header to content'),
  '--spacing-section': t('spacing', '64px', 'Section to section'),
  // Controls.
  '--spacing-control-2xs': t('controls', '20px', 'Kbd height'),
  '--spacing-control-xs': t('controls', '24px', 'Button xs'),
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
  '--spacing-field-inset': t('fields', '4px', 'Field edge to a button or chip seated in it, border included'),
  '--spacing-field-pad-y': t('fields', '8px', 'Block padding of a multi-line field'),
  // Rows.
  '--spacing-menu-item': t('rows', '32px', 'Menu, select and combobox row height'),
  '--spacing-menu-item-pad': t('rows', '8px', 'Menu, select and combobox row inline padding'),
  '--spacing-row-pad-x': t('rows', '12px', 'Item, table cell and flush accordion inline padding'),
  '--spacing-row-pad-y': t('rows', '12px', 'Item, table cell and flush accordion block padding'),
  '--spacing-row-gap': t('rows', '8px', 'Icon to label in any row: menus, command, sidebar, toast'),
  // Surfaces.
  '--spacing-modal': t('surfaces', '24px', 'Dialog and sheet padding'),
  '--spacing-popup': t('surfaces', '16px', 'Popover padding'),
  '--spacing-picker': t('surfaces', '12px', 'Calendar and color picker padding'),
  '--spacing-popup-inset': t('surfaces', '4px', 'Menu and select popup edge to its rows'),
  '--spacing-card-inset': t('surfaces', '4px', 'Card shell edge to its content'),
  '--spacing-card-band': t('surfaces', '12px', 'Card shell header and footer bands, above and below the text'),
  '--spacing-list-inset': t('surfaces', '8px', 'Sidebar, bottom nav panel and command list edge to rows'),
  // Marks.
  '--spacing-track': t('marks', '4px', 'Slider and progress track thickness'),
  // Radius roles.
  '--radius-control-xs': t('radius', '4px', 'Kbd and controls 16–20px'),
  '--radius-control-sm': t('radius', '8px', 'Badges and controls 20–28px'),
  '--radius-control': t('radius', '10px', 'Buttons, single-line fields, tabs'),
  '--radius-control-lg': t('radius', '12px', 'Button lg'),
  '--radius-popup': t('radius', '12px', 'Menus, popovers, selects'),
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
  '--text-heading': t('type', '20px', 'Section, dialog, sheet and empty titles'),
  '--text-heading--line-height': t('type', '28px', 'Heading line height'),
  '--text-subheading': t('type', '16px', 'Titles inside a card: an empty state'),
  '--text-subheading--line-height': t('type', '24px', 'Subheading line height'),
  '--text-body': t('type', '14px', 'Reading text, descriptions, row titles'),
  '--text-body--line-height': t('type', '20px', 'Body line height'),
  '--text-control': t('type', '14px', 'Buttons, fields, menus, tabs, tables'),
  '--text-control--line-height': t('type', '20px', 'Control line height: menu rows center on it'),
  '--text-label': t('type', '14px', 'Form labels and legends, at every width'),
  '--text-label--line-height': t('type', '16px', 'Label line height'),
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
  '--action-bar-status-pad-x': t('controls', '12px', 'Action bar status inline padding'),
  // Component sizing: fields.
  '--field-chip-pad-x': t('fields', '8px', 'Text buttons and chips in a field: file button, combobox chip'),
  '--textarea-min-height': t('fields', '60px', 'Textarea least height'),
  '--file-drop-zone-pad-x': t('fields', '24px', 'File drop zone inline padding'),
  '--file-drop-zone-pad-y': t('fields', '24px', 'File drop zone block padding'),
  '--file-drop-zone-sm-pad-x': t('fields', '12px', 'File drop zone sm inline padding'),
  '--file-drop-zone-sm-pad-y': t('fields', '8px', 'File drop zone sm block padding'),
  '--color-picker-row-gap': t('fields', '8px', 'Color picker custom area row gap'),
  '--color-picker-hue': t('fields', '12px', 'Color picker hue bar thickness'),
  // Component sizing: rows.
  '--item-gap': t('rows', '12px', 'Item media, content and actions apart'),
  '--sidebar-label-pad-x': t('rows', '8px', 'Sidebar group label inline padding'),
  '--sidebar-sub-height': t('rows', '28px', 'Sidebar sub-menu row height'),
  '--sidebar-sub-pad-y': t('rows', '6px', 'Sidebar sub-menu block padding'),
  '--bottom-nav-gap': t('rows', '8px', 'Bottom nav "More" row icon to label'),
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
  '--command-input-gap': t('rows', '8px', 'Command search icon to text'),
  '--command-heading-pad-y': t('rows', '6px', 'Command group heading block padding'),
  '--command-empty-pad-y': t('rows', '24px', 'Command empty note block padding'),
  '--command-footer-height': t('rows', '44px', 'Command footer height'),
  // Component sizing: surfaces.
  '--alert-pad': t('surfaces', '12px', 'Alert inset on every side, around the text and the action'),
  '--alert-radius': t('surfaces', '14px', 'Alert radius; below a card content corner, as a field is'),
  '--alert-dialog-icon': t('surfaces', '24px', 'Alert dialog media icon'),
  '--bottom-nav-radius': t(
    'surfaces',
    '16px',
    'Bottom nav and action bar corner, capped at half the bar (9999px: pill)',
  ),
  '--drawer-radius': t('surfaces', '32px', 'Drawer radius'),
  '--drawer-inset': t('surfaces', '8px', 'Drawer inset from the screen edge'),
  '--drawer-page-pad': t('surfaces', '10px', 'Drawer page padding and block gap'),
  '--drawer-menu-item-height': t('surfaces', '48px', 'Drawer menu row height'),
  '--drawer-menu-item-radius': t('surfaces', '14px', 'Drawer menu row radius'),
  '--drawer-menu-item-pad-x': t('surfaces', '14px', 'Drawer menu row padding and icon gap'),
  '--drawer-option-radius': t('surfaces', '16px', 'Drawer option row radius'),
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
  '--slider-thumb': t('marks', '16px', 'Slider thumb'),
  '--stepper-indicator-size': t('marks', '20px', 'Stepper numbered indicator'),
  '--timeline-marker-size': t('marks', '16px', 'Timeline marker'),
  '--timeline-step': t('marks', '24px', 'Timeline distance to the next event'),
  '--timeline-step-x': t('marks', '32px', 'Horizontal timeline distance to the next event'),
} as const satisfies Record<`--${string}`, SizingTokenSpec>;

export type SizingToken = keyof typeof SIZING_TOKENS;

/** The token names, in `SIZING_TOKENS` order. */
export const SIZING_TOKEN_NAMES = Object.keys(SIZING_TOKENS) as ReadonlyArray<SizingToken>;

/** Every token at its default, as in `tailwind.css`. */
export const DEFAULT_SIZING = Object.fromEntries(
  Object.entries(SIZING_TOKENS).map(([token, spec]) => [token, spec.value]),
) as Readonly<Record<SizingToken, string>>;
