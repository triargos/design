# Dashboard design

Style reference for UI work in `apps/dashboard`. One axis answers each design question; every token and component prop comes from one of them.

```text
What does it say?             → intent      neutral · primary · info · success · warning · destructive
How loud is it?               → emphasis    solid · subtle · outline · ghost · raised
Where does it sit?            → surface     page · shell · card · popup        ([data-surface])
What is the text for?         → type role   title · heading · body · control · caption · overline
How far from its neighbour?   → spacing     tight · related · group · page · section
What shape is it?             → radius role control-sm · control · control-lg · popup · card · dialog · panel
How high does it sit?         → elevation   flat · border · field · raised · popup · modal
How does it move?             → motion      enter · feedback · move
```

To see the result, run `pnpm web storybook`. The toolbar switches mode (light, dark, side by side), the three brand names (`OrganizationBrandingTheme`) and the surface a story sits on; the Tokens panel tunes the spacing steps, the type roles and the radius roles across every story (`storybook/kit/tokens.ts`); settle a value there, then change `tailwind.css`.

Storybook code lives in `storybook/`, never in `app/`; the app never imports it (lint enforces both directions). `.storybook/` is the config and preview runtime (`frame.tsx`, the shot runtime); `storybook/kit/` the page blocks (`blocks.tsx`: `FoundationPage`, `FoundationSection`, `ExampleSection`, `SpecimenList` + `SpecimenRow`, `Matrix`, `Preview`, `TileGrid` + `Tile`, `SwatchGrid`), `measure.ts`, `tokens.ts` and the `play` helpers; `storybook/foundations/`, `components/` and `patterns/` the stories; `storybook/examples/` the examples. The sidebar is `Foundations` (the live tokens), `Components` (one entry per `components/ui` file, A–Z, titled after the file: `alert-dialog.tsx` → `Components/Alert Dialog`) and `Patterns` (compositions with no file of their own). An entry opens on its `Board`, the page: title, description, one `ExampleSection` per example in a fixed order (Default, Variants, Sizes, content, structure, placement, in context, States), then Board-only spec sections (matrices, forced states, surfaces). Each example is also its own story. An example is one file, `storybook/examples/<entry>/<section>.tsx`, one named export `<Entry><Section>`, real usage with inline German data; it imports app code and packages only, never the kit or a story, so a registry can ship it as a block. An overlay example renders its trigger; its story opens it with `play` (`storybook/kit/play.ts`). Set `parameters.frame` (`centered`, `column`, `page`; `.storybook/frame.tsx`) instead of padding a story. States that need the pointer or keyboard are forced with `parameters.pseudo` (`storybook-addon-pseudo-states`, `Foundations/Interaction`); a Board shows overlays open on a stage through their `container` prop (`Components/Dialog`).

Look at every UI change rendered before reporting it done: `verify-ui` skill (`pnpm -s shot verify`). It shoots each `FoundationSection` by its title, so titles stay unique within a story; states worth checking on every change (hover, open, filled, motion, mobile) go in the story's `parameters.shots`.

## Color

Values come from `brandingThemeCss(theme)` (`lib/theme/branding-theme.ts`), rendered into a `<style>` by the page: `themeToCssVars` (`lib/theme/theme-to-css.ts`) projects the generated theme onto the tokens; `tailwind.css` maps them with `@theme inline`. A third block, generated at a higher contrast, applies under `prefers-contrast: more`. Generator internals: `lib/theme/README.md`.

### Intents

One set per intent. A bare intent is never a fill.

| Token | Role | Example |
|---|---|---|
| `{i}` | Hue for text, icons, dots on a neutral surface | `text-success` |
| `{i}-solid` / `{i}-solid-foreground` | Strong fill and its text | `bg-primary-solid text-primary-solid-foreground` |
| `{i}-subtle` / `{i}-subtle-foreground` | Tinted, translucent fill and its text | `bg-warning-subtle text-warning-subtle-foreground` |
| `{i}-border` | Edge | `inset-ring-destructive-border` |

- `primary` and `destructive` follow the brand (`primaryColor`, `destructiveColor`); `info`, `success`, `warning` are fixed hues (`INTENT_HUE`). `neutral` reads on any surface: translucent subtle and border, inverted solid.
- Components take `intent` and `emphasis` through `intentVariants` (`components/ui/intent-variants.ts`), which sets `--intent-*` from the intent and paints with them per emphasis. Write tokens directly only outside a component.
- `primary` is the brand hue for text and icons, like every bare intent; the brand fill is `primary-solid`. Never `bg-{intent}/10`.

### Text, fills, lines

| Token | Role |
|---|---|
| `foreground` | Titles, body text |
| `muted-foreground` | Descriptions, secondary text |
| `faint-foreground` | Placeholders, shortcuts, tertiary meta |
| `disabled-foreground` / `disabled` | Disabled text / disabled fill. Never `opacity-50`, except on graphic controls (slider) |
| `muted`, `field`, `shell` | Quiet fills, one step from the surface they sit on (`surfaceVars`) |
| `row-hover` · `muted` | Row under the pointer · selected row, in lists, tables, accordions; never `muted/{n}` for rows |
| `border-subtle` · `border` · `border-strong` | Row separators (lists, tables, accordions, sections in a card) · hairlines · edges that must read |
| `shadow-field` / `shadow-field-flat` | Field edge: a translucent ring, heavier at the bottom (light) or lit at the top (dark), with or without the lift; pure black/white, never tinted |
| `ring` | Focus: `ring-3 ring-ring/24` on fields and controls alike |
| `sidebar*` | The app frame behind the page panel |
| `chart-1` … `chart-5` | Chart series; static, not branded |

Never Tailwind's palette (`text-green-700`) or a literal color for brand or neutral surfaces.

A colour the organization chose (category, submission status) is data, not an intent: it reaches the element as a CSS variable from `style`, never mapped onto an intent. A `color` prop on `StatusDot` / `Badge` and categorical tokens are planned (`docs/ui-adoption-spec.md`, D8).

## Typography

- Family: `Inter Variable`. Roles (`--text-*` in `tailwind.css`) set size, line height, tracking and weight; they are the only sizes. Emphasis is `font-medium`, tone is a text level; neither is a new size.
- Titles come from their owner component; write `text-body`, `text-control` and `text-caption` directly.

| Role | px · weight | Use | Owner |
|---|---|---|---|
| `text-title` | 28 / 36 · 500, −0.02em | Page title; stat values with `tabular-nums` | `PageHeader`, `StatValue` |
| `text-heading` | 18 / 24 · 500, −0.01em | Section, dialog, sheet, empty-state titles | `SectionTitle`, `DialogTitle`, `SheetTitle`, `EmptyStateTitle`, `FieldLegend` |
| `text-body` | 14 / 21 · 400 | Reading text; descriptions (muted); row and card titles (medium) | `InsetCardTitle`, `ItemTitle`, `*Description` |
| `text-control` | 14 / 20 · 400 | Buttons, fields, menus, tabs, tables | `Button`, `Input`, `Select`, menu items, `TabsTrigger` |
| `text-caption` | 12 / 16 · 400 | Meta, timestamps, badges, tooltips | `Badge`, `Tooltip` |
| `text-overline` | 10 / 16 · 500, uppercase | Menu and group labels | |

- Touch: a text input renders 16px and scales to `text-control` (`input-scale` utility on the native input inside `Input` / `InputGroupInput`), so iOS does not zoom and fields look the same everywhere. Multi-line and segmented fields (`Textarea`, date and time segments) render 16px on coarse pointers.
- Only the roles exist; `text-sm` and the other t-shirt sizes do not compile. A new role goes in `tailwind.css` and in `cn` (`lib/utils.ts`), or `cn` drops the text color next to it.

## Spacing

Five steps, named by relationship (`Foundations/Spacing`). Peer blocks, and a heading and its content, share one gap (`group`). Sections sit three times as far apart (48); the page header sits between the two (32). Components own the steps; pages compose `PageContent`, `PageSection` and `InsetCard` and write no gaps between blocks. Owners use the name (`gap-group`, `p-group`, `mt-section`), never the number it currently equals.

| Step | px | Relationship | Owner |
|---|---|---|---|
| `tight` | 4 | A title and its description | `PageHeaderGroup`, `SectionHeaderGroup`, `ItemContent`, `FieldContent`, `DialogHeader`, `EmptyState` |
| `related` | 8 | Items that work together | `Field` (label → control), `PageHeaderTools`, `ItemActions` |
| `group` | 16 | Peer blocks; a heading → its content; padding inside a surface | `PageContent`, `PageSection`, `FieldGroup`, `InsetCardContent`, `InsetCardHeader` (inline), `DialogBody`, `SheetBody` |
| `page` | 32 | Page header → content | `PageContent` |
| `section` | 48 | Section ↔ section | `PageContent` around a direct-child `PageSection` |

- A gap derived from two steps is a `calc` of their variables, never a number.
- A section header sits `group` above its first block, indented to the card text (`alignToInsetCardText`, owned by `SectionHeaderGroup`). A section holds `InsetCard`s; a section title is always a `PageSection` or a `SectionHeaderGroup`.
- Padding inside rows and controls (`Item` `py-2.5`, `Callout` `px-5`, the card shell's `p-1`) follows control heights and radii, not this scale.
- Page inset: `px-5 pt-10 pb-28 md:px-10` (`main-layout.tsx`). Width via `MaxWidth` (`sm` 640, `base` 768, `md` 4xl, `lg` 1480).

## Shape

Fixed steps (`rounded-xs` 2 … `rounded-5xl` 24), picked by role. Write the role.

| Role | px | Use |
|---|---|---|
| `rounded-control-xs` | 4 | Controls 16–20px: checkbox, `Kbd` |
| `rounded-control-sm` | 8 | Controls 24–28px |
| `rounded-control` | 10 | Controls 32–36px (`Button` `xs`, `sm`, tabs) |
| `rounded-control-lg` | 12 | Controls and fields 40–44px |
| `rounded-popup` | 16 | Menus, popovers, selects |
| `rounded-card` | 20 | `InsetCard` shell, `Callout` |
| `rounded-dialog` | 20 | Dialogs, sheets |
| `rounded-panel` | 20 | The page panel |

- Concentric: `inner = outer − inset`. An outer surface sets `--outer-radius` and `--outer-inset` (the gap to its content); what sits inside takes `rounded-inner`. Something deeper in sets its own `--outer-inset`, its distance from the surface's edge. Surfaces: `InsetCard` (content 4px in; a card action row's button 8px in), `Callout` (action 6px in), `popupSurface` (items 4px in), modals (close button 12px in), fields (`InputGroup` buttons 8px / 4px in, combobox chips 4px in). Segmented tabs go the other way: track = tab + padding.
- Past ~12px of inset the formula reaches the control's own radius or zero: the layers are separate surfaces and the control keeps its role. Fields and buttons 16px into a card (`p-group`) keep `rounded-control*`; never `rounded-inner` there.
- Badges: `rounded-control-sm` to 28px, `rounded-control` at 32px; `shape='pill'` for counts and chips.
- Control heights: `Button` 32 / 36 / 40 / 44 (`xs`, `sm`, default, `lg`; icon-only sizes match), fields 40, tabs and pills 32. On coarse pointers every control under 44px gets a 44px hit area (`hit-area` utility; checkbox, radio and switch extend with `after:`).
- Card: `InsetCardHeader` is a one-line label strip on the shell (with `actions`: `min-h-11`, actions `xs` / `icon-xs`, ending on the same line as flush row actions). `InsetCardContent className='overflow-hidden'` only when a child paints to the card edge. Form card: `InsetCardContent className='p-4'` + `FieldGroup`.
- Apply flow (`routes/apply/**`): `ApplyPageHeader`; `FadeIn className='space-y-8'`; one button size (`default`, icon-only `icon-lg`), one filled button per page, bottom-right; a ghost Cancel sits on the left. Below `sm` the buttons go full width and stack, the filled one on top (`flex-col-reverse sm:flex-row`). Loading shows nothing, then `FadeIn`.

## Surfaces and elevation

| Layer | Classes | Owner |
|---|---|---|
| App frame | `bg-sidebar` | `body`, `MainLayout` |
| Page panel | `bg-background md:rounded-panel` | `MainLayout` |
| Card shell | `rounded-card bg-(--inset-card-shell)`, default `--shell` | `InsetCard` |
| Card | `cardSurface`: `bg-card`, an `--edge` border inside the box with `bg-clip-padding`, no drop | `InsetCardContent`, `DialogBody`, `SheetBody`, `AlertDialogHeader` |
| Popup | `popupSurface`: `rounded-popup bg-popover shadow-popup` | popovers, menus, selects |
| Modal | `modalShell` (`components/ui/modal.ts`): `--shell` + `shadow-modal`, the body a card | `DialogContent`, `AlertDialogContent`, `SheetContent` |

- Elevation: `shadow-border` (ring only), `shadow-field` (+ `-flat`), `shadow-raised` (+ `-hover`), `shadow-popup`, `shadow-modal`. Every level shares one edge: a translucent ring outside the fill (`--edge`, `--edge-field`), so it takes the color of whatever sits behind it and no seam opens between edge and fill; higher levels add drop. Card surfaces (`cardSurface`, the `Table` card body) draw the same `--edge` as a border inside the box with `bg-clip-padding` and no drop, so the shell rim keeps its full inset. Fields and popups weight the ring toward the light: heavier bottom edge in light, lit top edge in dark. Never an opaque gray border for depth. Borders are for structure (dividers, table rules, dashed drop zones) and state (focus, invalid); a field's border is transparent until focused. Dark: no drops (popups keep a faint 5% drop), one white ring. Colors in `tailwind.css`, not literals.
- Quiet fills (`muted`, `field`, `shell`, `neutral-subtle`) re-declare per `[data-surface]`, so the same class reads one step from its surface. Restyle a shell by setting its variable, not `bg-*`.
- In dark mode, raised neutral controls use `dark:bg-foreground/10` (inside `intentVariants` `raised`).

## Motion

Roles in `tailwind.css`, named by what moves (`Foundations/Motion`). Write the role, never the number.

| Role | Value | Use |
|---|---|---|
| `duration-enter` | 100ms | Popups, menus, dialogs entering and leaving (fade, zoom from 95%) |
| `duration-feedback` | 150ms | Hover, press, colour on controls and rows |
| `duration-move` | 200ms | Something travelling on screen: tab indicator, sheet, switch thumb |
| `duration-sheet` | 500ms | The touch drawer opening, closing, settling after a swipe; with `ease-sheet` |
| `ease-enter` | `cubic-bezier(0.23, 1, 0.32, 1)` | Enter and exit |
| `ease-move` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | Moving what is already on screen |
| `ease-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | The touch drawer after a swipe |

- Hover and colour use the default `ease`; never `linear` or `ease-in` for UI.
- Interruptible motion is a spring in code (`insetCardRevealTransition`). Reduced motion stops movement: `motion-reduce:`, `useReducedMotion()`.
- Interaction states (`Foundations/Interaction`): hover strengthens the fill or edge (a row: `hover:bg-row-hover`), press scales buttons to 96%, focus is `ring-3 ring-ring/24` for the keyboard only, disabled uses the `disabled` tokens.

## Components

`components/ui` holds design-system primitives only, each with a Storybook entry; a component that knows a feature's data, hooks or routes lives in `components/<feature>`. `components/ui` imports only `~/components/ui`, `~/lib/*`, `~/hooks/*` and `@elternportal/domain`. Reuse these; style variants go through `cva` on the existing component.

| Need | Use |
|---|---|
| Page layout | `PageContent` with `PageHeaderGroup`, `PageHeader`, `PageDescription`; `PageSection`; page tabs `TabsList as='nav'`. Title with actions: `PageHeaderRow` > `PageHeaderGroup` + `PageHeaderTools`. Navigation above the title: `PageHeaderSection` > `PageHeaderBackLink` (never a hand `ChevronLeftIcon` link), then the group or row, then tabs. Status under the title: `PageHeaderMeta`. Without `PageContent`: a child route whose layout renders the header (person, address, application tabs), and full-bleed canvases (form builder, inbox) |
| Content block | `InsetCard` → `InsetCardHeader` → `InsetCardContent` → optional `InsetCardFooter`; list rows `ItemList` (in `InsetCardContent className='overflow-hidden'`) |
| Button | `intent` × `emphasis`. Pairs: `primary`/`solid` the one main action; `neutral`/`raised` every other; `neutral`/`ghost` header, row, toolbar, close; `destructive`/`solid` inside a confirmation and in a danger zone; `destructive`/`subtle` opens a confirmation anywhere else; `destructive`/`solid` also submits a form whose submit is the destructive act (reject with a reason). `isLoading` holds the spinner at least 800ms; a submit button takes `isLoading={form.formState.isSubmitting}`, not `disabled`. `variant` is deprecated |
| Status | `Badge` (`intent`, `emphasis` subtle · solid · outline, `size` sm · md · lg · xl, `shape`). One pattern per intent: a state is a subtle `Badge`; a dot (`StatusDot intent`) or a hue only next to a label that names it |
| Notice | `Callout` (`intent`, always subtle) with `CalloutContent`, `CalloutAction`. Never an icon: the intent says what kind of notice it is, the first line says the rest. `tone` is deprecated |
| Tabs | `Tabs` + `TabsList variant` `segmented` (views of a page) · `underline` (sections in a card) · `pill` (filters); the indicator slides. `TabsList as`: `tabs` (default, Base UI with panels) · `nav` (route links, `TabsTrigger to`) · `radio` (single choice, `value`/`onValueChange`, defaults to `pill`) |
| Tooltip | `TooltipContent appearance` `light` or `inverted` (compared in `Components/Tooltip`); opens after 200ms |
| Fields | `Input`, `Textarea`, `SelectTrigger`, `InputGroup`, `PickerTrigger`; custom field surfaces use `inputSurfaceVariants({ scope })`. `Input`'s `className` styles the surface, every other prop goes to the native input |
| Forms | `Field`, `FieldLabel`, `FieldDescription`, `FieldError` in a `FieldGroup`; with react-hook-form, `Controller` renders the `Field` (`data-invalid` from `fieldState`, the field name as the control's id, `FieldError errors={[fieldState.error]}` unguarded: it renders nothing without an error). Settings row (label and description left, control right): `Field orientation='horizontal'` > `FieldContent` + control, in the card's `FieldGroup`; never `ItemList` > `Item` > `Field`. Divider: `FieldSeparator`, with children for a labelled one („oder“). Unsaved changes: `UnsavedChangesToast` (`components/features/form`, on `BottomFloatMenu`; `Patterns/Settings Form`) |
| Popups | `PopoverContent`, `DropdownMenuContent`, `SelectContent`; custom popups use `popupSurface`. A destructive menu item is `intent='destructive'`, last, after a separator |
| Modal | One shape (`components/ui/modal.ts`): header and footer on the shell, content in a card. `Dialog`: `DialogHeader`, `DialogBody`, `DialogFooter`; a form wraps `DialogBody` and `DialogFooter` (`<form className='contents'>`), submit in the footer (`Components/Dialog` Default). Every confirmation is an `AlertDialog` (the header is the card), never a `Dialog`. `Sheet`: `SheetHeader`, `SheetBody`, `SheetFooter`. `Drawer` is the touch bottom sheet |
| Choice | `Checkbox` (also `indeterminate`), `RadioGroup` + `RadioGroupItem`, `Switch` (a setting that applies at once); a few roomy options: `RadioGroup` + `ChoiceCard`. Checked takes `primary-solid` |
| Date and time | `DateInput` (`IsoDate`; `variant='card'` with a label), `TimeInput` (`HH:mm`), `Calendar`; display with `intl-date` |
| Combobox | Short list: `Combobox` (single, or `multiple` with `ComboboxChips`); long or loaded: `Combobox virtualized` + `VirtualizedComboboxList`; picking a value in a form: `SearchSelect` (`Components/Combobox`, `Components/Search Select`) |
| Reorder | `SortableItem` + `SortableItemHandle` in a dnd-kit `SortableContext`; only the handle drags |
| Numbers | `Stat` > `StatValue` (title role, `tabular-nums`) + `StatLabel` (caption; a `StatusDot` before it ties it to a series); charts: `ChartContainer` on `chart-1` … `chart-5` |
| Copy | `CopyButton value` (ghost, icon-only by default; check for 2s; `onCopied` for a toast); in a field: `className={inputGroupButtonVariants({ size: 'icon-sm' })}` |
| Keys | `Kbd`, `KbdGroup`; a control with a shortcut: `ShortcutTooltip` |
| Person | `Avatar` (`size` `xxs` 12 · `xs` 16 · `sm` 20 · `md` 24 · `lg` 28 · `xl` 32 · `2xl` 40 · `3xl` 48 · `4xl` 80; `shape` circle · square for organizations) with `AvatarImage`, `AvatarFallback` (`getInitials`: two letters); initials on `muted`, never the brand fill. `AvatarGroup size shape` (sets its avatars; each is masked out of the next, no surface ring) + `AvatarGroupCount` |
| Pending bar | `BottomFloatMenu` for a selection (bulk actions) or unsaved changes (`UnsavedChangesToast`; `UnsavedChangesIndicator` in a card footer is legacy); controls in `BottomFloatMenuItem`, panels from `BottomFloatMenuRow`. It portals into `MainLayout`'s slot (`FloatMenuSlotContext`) |
| Sequence | `Stepper` (steps someone goes through), `Timeline` (events that happened); `Accordion` for sections opened in place |
| Records | `Table` (`variant` `card` in an `InsetCard`, `flush` in `InsetCardContent`) |
| Feedback | `toast` from `lib/toast` (`Toast` renders it) |
| Files | `FileDropZone` (`size` default · compact); with uploads: `FileUploadDropzone` in `components/files` |
| Danger zone | The last settings card: `InsetCard tone='destructive'` > `ItemList` > `Item`. A destructive row: `destructive`/`solid` button → `AlertDialog`, type-to-confirm for what cannot be undone. Lifecycle rows that can be undone (publish, withdraw, archive, restore, impersonate) may sit here with a `neutral`/`raised` button (`Patterns/Danger Zone`) |
| Not found, failed load | `ErrorState` with `ErrorStateActions` (a back `Button render={<Link/>}`), not `EmptyState`; in a route error boundary `RouteErrorState` (`components/error`, `Patterns/Route Error State`) |
| Empty, loading | `EmptyState` (`size='sm'` inside a card, `bordered` for a dashed area, never `className='border'`); `Skeleton`; `Loader` (spinner in `currentColor`); `Progress` for known progress; `FadeIn` for content arriving after a load |

## Do / don't

- Do pick an intent and an emphasis; don't pick a color.
- Do pair a fill with its foreground: `{i}-solid` with `{i}-solid-foreground`, `{i}-subtle` with `{i}-subtle-foreground`.
- Don't use a bare intent as a fill (`bg-success`), or a `/10` tint for status.
- Don't dim with `opacity-50`; use `disabled` and `disabled-foreground`.
- Don't write a radius step where a role exists, or a literal radius (`rounded-[24px]`); nest with `rounded-inner`.
- Don't write shadow literals; use the four elevations.
- Don't add `dark:` color overrides to card surfaces; fix the token.
- Don't put an icon in a `Callout`; there is no slot for one.
- Don't write `var(--color-*)` in arbitrary values; write the raw token (`var(--card)`, `var(--info-subtle)`). `--color-*` resolves on `:root`, so it misses a nested `.dark` (Storybook side by side) and `[data-surface]` overrides.
- Don't read generator tokens (`bgShade`, `labelMuted`, …) in components; promote one in `themeToCssVars` and map it in `@theme inline`. Don't add `*Thin` generator tokens (they differ between server and client).

## Agent quick reference

```text
intent        neutral · primary · info · success · warning · destructive
emphasis      solid · subtle · outline · ghost · raised      (intentVariants)
button        primary/solid · neutral/raised · neutral/ghost · destructive/solid · destructive/subtle
text          foreground · muted-foreground · faint-foreground · disabled-foreground
type          title 28 · heading 18 · body 14 · control 14 · caption 12 · overline 10
spacing       tight 4 · related 8 · group 16 · page 32 · section 48
radius        control-xs 4 · control-sm 8 · control 10 · control-lg 12 · popup 16 · card 20 · dialog 20 · panel 20 · rounded-inner
elevation     shadow-border · shadow-field · shadow-raised · shadow-popup · shadow-modal   (one translucent ring + drop)
block         InsetCard > InsetCardHeader > InsetCardContent [> ItemList]
modal         DialogContent > DialogHeader · DialogBody (card) · DialogFooter
motion        duration-enter 100 · feedback 150 · move 200 · sheet 500 · ease-enter · ease-move · ease-sheet
new color     themeToCssVars + @theme inline, never a literal
```
