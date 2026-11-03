# Pavo on Foldkit: findings

All 60 React components have a Foldkit port, each with its docs page (57 pages; Spinner, IconSwap and ActionBar share pages; Link is not needed). Tokens, `cn`, `intentVariants`, the theme generator and the customize tokens are imported from the React kit, not copied. Visual parity was checked page by page against the React site in light and dark mode, behaviour with Playwright.

## Status

|              | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✓ Parity     | accordion, alert, alert-dialog, avatar, badge, bottom-nav, breadcrumb, button, button-group, calendar, card, checkbox, color-picker, command, copy-button, dialog, drawer, empty, fade-in, field, file-drop-zone, input, input-group, input-otp, intl-date, kbd, popover, progress, prose, radio-group, separator, sheet, shortcut-tooltip, sidebar, skeleton, sortable, spinner, stat, status-dot, stepper, switch, table, tabs, textarea, timeline, toggle, tooltip |
| ◐ Partial    | combobox (no virtualisation), context-menu (no submenu, no long-press), date-input (label click does not focus the first segment), dropdown-menu (no submenu), integer-input (no digit exit roll), item (no `scrollElement`), select (no scroll arrows), slider (one thumb: range is two sliders), toast (own view over the Toast Model), chart (bar and line, no y-axis)                                                                                             |
| ✗ Not ported | locale, pavo-provider (React context), link (Foldkit routes `<a href>` itself)                                                                                                                                                                                                                                                                                                                                                                                        |

## Showcase

- Same frame as the React site, built from the ported Sidebar (⌘[ collapses it, a sheet below `md`), the theme picker (System / Light / Dark, follows the OS) and the Customize menu: font, sizing style, density and scale, radius, brand swatches, token sliders, reset. Saved in localStorage.
- Not ported from Customize: "Examples on" a surface (see No context) and dragging the button to a corner.
- No Foundations or Patterns pages.

## Size (gzip, minified)

| Import                      | React (without react-dom) | Foldkit (with runtime and Effect) |
| --------------------------- | ------------------------: | --------------------------------: |
| Typical app (13 components) |                  105.5 kB |                          126.7 kB |
| Everything                  |                  371.2 kB |                          204.4 kB |

A React app adds react-dom (~45 kB gzip). React's "everything" includes recharts, React Aria, cmdk, dnd-kit; the Foldkit chart is a 470-line SVG.

## Where Foldkit helped

- One state model. Close-confirmation, a tooltip delay group, closing dialogs on navigation, opening a dialog from a menu item: a few lines in update instead of providers, refs and effects.
- `@foldkit/ui` covers the accessibility of most primitives: Dialog (focus trap, Escape, scroll lock, nested), Menu, Listbox, Combobox, Popover, Tooltip, Tabs, RadioGroup, Slider, Calendar, DatePicker, FileDrop, DragAndDrop, Disclosure, Checkbox, Switch, Input. Ports were mostly copying classes.
- Tagged values replace string sentinels: Select's custom value is `Listed | Custom`, a date range is a union, "fade only on first load" is `Loaded({ isFadingIn })`.
- Pure functions replace observers: "does this More group hold the current page" (BottomNav) is a function of the Model; React needs a MutationObserver.
- Measure in a Mount, keep the size in the Model, animate with CSS: replaced most of Framer Motion (Drawer height spring, BottomNav morph, Toast stack).
- `Update.foldChildAt` keeps pages with many instances short (five radio groups, nine copy buttons, four navs).

## Where it fought

- **No context.** Every docs-wide or tree-wide value is threaded explicitly: Table passes `variant` to every row and cell, Avatar.group passes size, the theme and locale are config fields. The customize menu's "Examples on" surface is not ported: every page view would need it as a view input.
- **No portals.** A popup renders where it is called. A `<dialog>` under a `hidden` ancestor never shows, so the sidebar renders either the desktop column or the mobile sheet.
- **Elements are reached through Messages.** Measuring, focusing, starting an animation or catching an image error needs a Mount or a Command and a Message from the caller, even for a stateless part (Avatar `onError`, Skeleton pulse sync, focus on field padding).
- **No presence.** Exit animations need "keep it mounted until the transition ends" code per component; Base UI and AnimatePresence give it for free.
- **Controlled inputs.** When the Model value does not change but the DOM text did (a refused character), the input is not patched; IntegerInput re-syncs with a Command.
- **Key events resolve against the last render.** Keys that arrive before the next render see stale state; DateInput tracks the active segment in the Model.
- **Wiring.** 57 pages × Model field, wrapper Message, fold, route, view case is ~1,100 lines; `scripts/pages.mjs` generates it.
- **`h.Class` replaces, it does not merge.** Every part emits one class string; callers pass `className`.
- **Dev server.** `@foldkit/vite-plugin` restores the last Model after a hot reload, route included, for whatever tab loads next: parallel agents saw each other's pages.

## Gaps in @foldkit/ui (vs Base UI, React Aria, cmdk)

- Menu: no submenus, no checkbox or radio items, no separators inside a group, cannot open at a pointer position; first ArrowDown after a pointer open skips item 0.
- Dialog: modal only, no "nested dialog open" signal, no Escape-only dismissal; exit waits only on the panel's own transition.
- Tooltip: no exit animation, no delay group. Popover: no title/description wiring, focuses the panel.
- Toast: no upsert or dedupe, no height-based stack, swipe left/right only.
- Combobox: no empty state, no slot for chips or a clear button, no virtualisation.
- VirtualList: renders `ul`/`li` only (no table), no outside scroll element.
- DragAndDrop: no handle-only mode, forces listbox roles.
- Missing: OTP field, Toggle, multi-thumb slider, number field, segmented date field, range calendar, command palette, colour area, Avatar, Separator, presence.
