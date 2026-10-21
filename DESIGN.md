# Triargos Design

The guide to this design system. Each design question has one axis. Every token and every component prop comes from one of these axes.

```text
What does it say?             → intent      neutral · primary · info · success · warning · destructive
How loud is it?               → emphasis    solid · subtle · outline · ghost · raised
How big is it?                → size        default · sm · xs · lg (per component)
Where does it sit?            → surface     page · shell · card · popup        ([data-surface])
What is the text for?         → type role   title · heading · body · control · caption · overline
How far from its neighbour?   → spacing     tight · related · group · card · page · section
What shape is it?             → radius role control-xs · control-sm · control · control-lg · popup · card · dialog · panel
How high does it sit?         → elevation   flat · border · field · raised · popup · modal
How does it move?             → motion      enter · feedback · move · sheet
```

## Repo

| Path                                  | Holds                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/<c>.tsx`           | One component per file. It imports only `~/components/ui`, `~/lib/*` and `~/hooks/*`.                                                                                                                                                                                   |
| `src/lib/theme/`                      | Theme generator (`README.md`), `brandingThemeCss`, `themeToCssVars`                                                                                                                                                                                                     |
| `src/tailwind.css`                    | Tokens: `@theme inline` colors, roles, motion, utilities. No `@import 'tailwindcss'`: an entry imports it after Tailwind (`site/styles.css`; an app's own entry, README)                                                                                                |
| `docs/components/<c>.tsx`             | Docs page for a component: `export default defineDocs({ title, description, group, Page, playground? })`                                                                                                                                                                |
| `docs/foundations/`, `docs/patterns/` | Token pages (Color, Typography, Spacing, Surfaces, Shape, Loading, Interaction, Motion) and compositions (Bulk Selection, Confirmation, Danger Zone, List in Card, Page)                                                                                                |
| `docs/examples/<c>/<section>.tsx`     | One example per file, one named export `<C><Section>`. It imports app code and packages, never the kit. English copy from one domain: a team workspace (projects, tasks, members, documents, invoices, settings).                                                       |
| `docs/kit/`                           | Page blocks (`blocks.tsx`): `FoundationPage`, `ExampleSection`, `FoundationSection`, `SpecimenList` + `SpecimenRow`, `Matrix`, `StateCell`, `TileGrid` + `Tile`, `SwatchGrid`, `GapRuler`. Also `defineDocs` (`docs.ts`), `tokens.ts`, `forced-states.ts`, `stack.tsx`. |

- To add a component, write the component, then `docs/components/<c>.tsx`, then its examples. The page title follows the file name (`alert-dialog.tsx` → Alert Dialog).
- A page lists its examples in this order: Default, Variants, Sizes, content, structure, placement, in context, States. The description is one sentence.
- Run `pnpm dev` to see the docs site. Customize switches mode, the three brand names (`BrandingTheme`), the surface, and the tunable spacing, type and radius values (`docs/kit/tokens.ts`). Settle a value there, then change `tailwind.css`.
- Forced states in a matrix: `StateCell state='hover' | 'press' | 'focus'`. A Board shows an overlay open on a stage through the overlay's `container` prop.

## API rules

- **Intent-based props.** A prop says what the caller means, never how it is drawn. The common case needs no props.
- **Shared vocabulary.** Color is `intent` × `emphasis` (`intentVariants`, `components/ui/intent-variants.ts`). Other axes are `size`, `orientation`, `invalid`/`aria-invalid`, `disabled`. Don't add synonyms such as `variant`, `tone`, `kind`, `color` or `appearance`. `color` is only a color from data (`Badge`, `StatusDot`: any CSS color), exclusive with `intent` in the type. Use `variant` only for a structural choice: `TabsList`, `Table`, `EmptyMedia`, `ItemMedia`.
- **shadcn-shaped.** One file per component, on Base UI; every part sets `data-slot` and takes `className` (merged with `cn`). Compose `<X><XTitle/>…</X>`, parts over flags. For polymorphism, use Base UI `render` / `useRender`.
- **Classes inline.** A part writes its classes in its own `className`. No class-string constants, shared or local, and no files of shared classes: repeat the classes in each component, as shadcn does. A style with variants is a `cva` (`buttonVariants`, `inputSurfaceVariants`), exported only when another component composes it.
- **Library, not app.** No page layout, app frame, routing or app copy in `src/components/ui`; compositions of parts are docs examples and patterns (blocks), which an app copies.
- **Value controls** take `value` + `onValueChange`. Dates are `YYYY-MM-DD` strings, times are `HH:mm`, options are `SelectOption { value, label, description? }`.
- **Copy belongs to the caller.** Empty text, status text and placeholders come from `children` or a prop. Labels of a component's own controls (`closeLabel`, `clearLabel`, `chooseDateLabel`, `slotLabel`, a landmark's `aria-label`, …) come from the prop, else from `LocaleProvider` `labels`, else English. A new built-in label goes in `Labels` (`components/ui/locale.tsx`) with its English default; never a literal in a component.
- **Formatting** (`IntlDate`, `Calendar`, `DateInput`, `TimeInput`, `Progress`, `ChartTooltipContent`) takes `locale` (BCP 47) and, for a moment, `timeZone`; unset, they come from `LocaleProvider`, else `en-US` and the runtime's zone (deterministic for prerendering). One `LocaleProvider` sits at the app's root; it also sets React Aria's locale.
- **One way to do each thing.** Delete an old API in the same change that migrates its callers. No deprecated aliases.

## Color

Values come from `brandingThemeCss(theme)` (`lib/theme/branding-theme.ts`), which the page renders into a `<style>`. `themeToCssVars` (`lib/theme/theme-to-css.ts`) projects the generated theme onto the tokens, and `tailwind.css` maps them with `@theme inline`. A third block, generated at a higher contrast, applies under `prefers-contrast: more`.

| Token                               | Role                                     | Example                                            |
| ----------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `{i}`                               | Hue for text, icons, dots. Never a fill. | `text-success`, `text-primary`                     |
| `{i}-solid` / `-solid-foreground`   | Strong fill and its text                 | `bg-primary-solid text-primary-solid-foreground`   |
| `{i}-subtle` / `-subtle-foreground` | Translucent tinted fill and its text     | `bg-warning-subtle text-warning-subtle-foreground` |
| `{i}-border`                        | Edge                                     | `inset-ring-destructive-border`                    |

- `primary` and `destructive` follow the brand. `info`, `success` and `warning` are fixed hues. `neutral` reads on any surface: translucent subtle and border, inverted solid.
- Components paint through `intentVariants`. Write tokens directly only outside a component.
- A color chosen by data (a label, a category an organization picked) is data, not an intent. `Badge color` and `StatusDot color` take any CSS color, exclusive with `intent`. Inside a component, `intentVariants({ intent: 'data' })` + `dataColorStyle(color)` set `--data-color`, and the `intent-data` utility derives the `--intent-*` set from it, so every emphasis paints from the one color in both modes. With no picked color, take `var(--category-N)` in order.

| Token                                                                          | Role                                                                                           |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `foreground` · `muted-foreground` · `faint-foreground` · `disabled-foreground` | Titles and body · descriptions · placeholders, shortcuts, tertiary meta · disabled text        |
| `disabled`                                                                     | Disabled fill. Never `opacity-50`; fields fade to `opacity-64`, graphic controls (slider) dim. |
| `muted`, `field`, `shell`                                                      | Quiet fills, one step from their surface. `muted` is also the selected row.                    |
| `row-hover`                                                                    | Row under the pointer in lists, tables, accordions                                             |
| `skeleton`                                                                     | The `Skeleton` fill: `foreground` thinned, reads on any surface                                |
| `border-subtle` · `border` · `border-strong`                                   | Row separators · hairlines · edges that must read                                              |
| `ring`                                                                         | Focus: `ring-3 ring-ring/24` on fields and controls alike                                      |
| `sidebar*`                                                                     | The app frame behind the page panel                                                            |
| `chart-1` … `chart-5`                                                          | Chart series: static, not branded, read as `var(--chart-N)`                                    |
| `category-1` … `category-8`                                                    | Things told apart, not ranked: static, not branded, a step per mode. A data color or a swatch  |
| `image-edge`                                                                   | The 1px hairline on a photo (`Avatar`): black at 10%, white in dark                            |
| `thumb`                                                                        | Switch and slider thumb: white in both modes                                                   |

## Typography

Family: `Inter Variable`. The roles are the only sizes; `text-sm` and the other t-shirt sizes do not compile. Emphasis is `font-medium` and tone is a text level; neither one is a new size.

| Role            | px · weight              | Use                                                                                                            | Owner                                                   |
| --------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `text-title`    | 28 / 36 · 500, −0.02em   | Page title; a big number (`tabular-nums`)                                                                      | Page pattern, `StatValue`                               |
| `text-heading`  | 18 / 24 · 500, −0.01em   | Section, dialog, sheet, empty titles                                                                           | Page pattern, `DialogTitle`, `SheetTitle`, `EmptyTitle` |
| `text-body`     | 14 / 21 · 400            | Reading text; descriptions (muted); row titles (medium). The card header sets 20px leading, its title semibold | `CardTitle`, `ItemTitle`, `*Description`                |
| `text-control`  | 14 / 20 · 400            | Buttons, fields, menus, tabs, tables                                                                           | `Button`, `Input`, `SelectTrigger`, menu items, tabs    |
| `text-caption`  | 12 / 16 · 400            | Meta, timestamps, badges, tooltips                                                                             | `Badge`, `TooltipContent`                               |
| `text-overline` | 10 / 16 · 500, uppercase | Menu and group labels                                                                                          | menu labels                                             |

- Icons (Tabler, `@tabler/icons-react`) draw a 1.25px stroke at every size, the weight of their label (`svg.tabler-icon` in `tailwind.css`). Don't pass `strokeWidth`.
- Below `sm` (640px), fields render 16px text (`max-sm:text-[1rem]`) and `FieldLabel` 16 / 18, so iOS does not zoom on focus. From `sm` up: 14px.
- A new role goes in `tailwind.css` **and** in `cn` (`lib/utils.ts`). Otherwise `cn` drops the text color next to it.

## Spacing

Six steps, named by relationship. Components own the gaps inside them; the page layout (the Page pattern) owns the gaps between them. Use the step name (`gap-group`, `p-group`), never its number.

| Step      | px  | Relationship                                                   | Owner                                                                                  |
| --------- | --- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `tight`   | 4   | A title and its description                                    | Page header and section titles, `ItemContent`, `FieldContent`, `DialogHeader`, `Empty` |
| `related` | 8   | Items that work together                                       | `Field` (label → control), page header actions, `ItemActions`                          |
| `group`   | 16  | Peer blocks; a heading → its content; padding inside a surface | Page header stack, sections, `FieldGroup`, `DialogBody`, `SheetBody`                   |
| `card`    | 20  | Padding inside a card; its header, footer and rows on one edge | `CardContent` (`p-card`), `CardHeader`, `CardFooter`, `ItemList` rows, `Table` edges   |
| `page`    | 32  | Page header → content                                          | Page pattern                                                                           |
| `section` | 48  | Section ↔ section                                              | Page pattern                                                                           |

- A gap derived from two steps is a `calc` of their variables.
- A section title sits indented to the card text: `px-[calc(--spacing(1)+1px+var(--spacing-card))]` (shell 4px + edge 1px + `card`). A section holds `Card`s.
- Padding inside rows and controls (`Item`, `Alert`, the card shell's `p-1`) follows control heights and radii, not this scale.

## Shape

Fixed steps run from `rounded-xs` (2px) to `rounded-5xl` (24px). Write the role, not the step, and never a literal radius.

| Role                 | px  | Use                                                     |
| -------------------- | --- | ------------------------------------------------------- |
| `rounded-control-xs` | 4   | Controls 16–20px: checkbox, `Kbd`                       |
| `rounded-control-sm` | 8   | Controls 20–28px, badges                                |
| `rounded-control`    | 10  | Controls 32–36px (`Button` `xs`, default, tabs), fields |
| `rounded-control-lg` | 12  | Controls 40px (`Button` `lg`)                           |
| `rounded-popup`      | 16  | Menus, popovers, selects                                |
| `rounded-card`       | 20  | `Card` shell, `Alert`                                   |
| `rounded-dialog`     | 20  | Dialogs, sheets                                         |
| `rounded-panel`      | 20  | The page panel                                          |

- Concentric corners: `inner = outer − inset`. The outer surface sets `--outer-radius` and `--outer-inset`; what sits inside takes `rounded-inner`. Owners: `Card` (content 4px in), `Alert` (action 6px in), popups (items 4px in), `InputGroup` buttons (4px in), combobox chips (4px in).
- `Avatar` `shape='square'` is the one exception: its radius steps with its size (`rounded-xs` at 12px to `rounded-2xl` at 80px), an icon-like scale no role covers.
- Past about 12px of inset, the layers are separate and a control keeps its own role. Fields and buttons in a card keep `rounded-control*`: a 10px field 21px into the 12px content is two layers, not a failed concentric pair.
- Control heights:

  | Control  | Heights                                                                          |
  | -------- | -------------------------------------------------------------------------------- |
  | `Button` | `xs` 32 · default 36 · `lg` 40 (`icon-*` match)                                  |
  | Fields   | 36: `Input`, `SelectTrigger`, `InputGroup`, date and time (one height, no sizes) |
  | Tabs     | 32                                                                               |
  | `Badge`  | default 24 · `sm` 20 (`shape='pill'` for counts and chips)                       |

- On coarse pointers, every control under 44px gets a 44px hit area (`hit-area`; checkbox, radio and switch use `after:`).

## Surfaces and elevation

| Layer      | Classes                                                                                                                                                 | Owner                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| App frame  | `bg-sidebar`                                                                                                                                            | `body`, `Sidebar`                                           |
| Page panel | `bg-background md:rounded-panel`                                                                                                                        | the page frame                                              |
| Card shell | `rounded-card bg-(--card-shell)`, default `--shell`                                                                                                     | `Card`                                                      |
| Card       | `bg-card`, an `--edge` border inside the box (`bg-clip-padding`), `shadow-card`                                                                         | `CardContent`, `Table variant='card'` body                  |
| Popup      | `rounded-popup bg-popover shadow-popup`, fade + zoom from 95% over `duration-enter`                                                                     | `PopoverContent`, menus, `SelectContent`, `ComboboxContent` |
| Inverse    | `data-surface='inverse'` + `rounded-popup bg-popover shadow-popup`: the other mode's tokens, dark on a light page and light on a dark one               | `BottomNav`, `ActionBar`                                    |
| Modal      | `rounded-dialog bg-popover shadow-modal`; header and body `--modal-inset` (24px) in, the footer a `muted` band under a rule; backdrop `black/32` + blur | `DialogContent`, `AlertDialogContent`, `SheetContent`       |

- Elevations: `shadow-border` (ring only), `shadow-field` (+ `-edge`, `-flat`; drop only, on a field's `--edge-field` border), `shadow-card` (drop only, on a bordered card), `shadow-raised` (+ `-hover`), `shadow-popup`, `shadow-modal`.
- Every elevation shares one edge: a translucent ring outside the fill (`--edge`), which takes the color of whatever is behind it. Higher levels add drop.
- Fields draw their edge as a real border inside the box (a 32px field measures 32px); a `::before` with `shadow-field-edge` lays the accent on it. Fields and popups weight the edge toward the light: heavier at the bottom in light mode, lit at the top in dark. Dark mode drops the shadow and keeps one white ring.
- Borders are for structure (dividers, table rules, dashed drop zones) and state (focus, invalid), never for depth.
- Quiet fills re-declare per `[data-surface]`, so the same class reads one step from its surface. Restyle a shell by setting its variable.
- `[data-surface=inverse]` re-declares every color token from the other mode (`brandingThemeCss`), so components inside it need no changes. `dark:` variants still follow the page, and so do the edges and drops.

## Motion

| Role                | Value                                  | Use                                                               |
| ------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `duration-enter`    | 100ms                                  | Popups, menus entering and leaving (fade, zoom from 95%)          |
| `duration-feedback` | 150ms                                  | Hover, press, color on controls and rows                          |
| `duration-move`     | 200ms                                  | Something travelling: tab indicator, sheet, switch thumb, sidebar |
| `duration-modal`    | 150ms                                  | Dialogs and their backdrop entering and leaving                   |
| `ease-enter`        | `cubic-bezier(0.23, 1, 0.32, 1)`       | Enter and exit                                                    |
| `ease-move`         | `cubic-bezier(0.645, 0.045, 0.355, 1)` | Moving what is already on screen                                  |

- Hover and color changes use the default `ease`, never `linear` or `ease-in`. Interruptible motion is a spring in code (`CardFooter`).
- Reduced motion keeps fades and color changes and drops movement (zoom, slide, press scale, a travelling indicator, a height fold, springs): popups, dialogs and sheets fade in place. `motion-reduce:` in CSS (`motion-reduce:data-open:zoom-in-100`), `useReducedMotion()` in code.
- Interaction states:

  | State    | Behavior                                   |
  | -------- | ------------------------------------------ |
  | Hover    | Strengthens the fill or edge               |
  | Press    | Buttons scale to 96%, except menu triggers |
  | Focus    | `ring-3 ring-ring/24`, keyboard only       |
  | Disabled | `disabled` tokens, no pointer events       |

## Components

| Need                   | Use                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button                 | `Button`: no props = neutral/raised, every ordinary action. `intent='primary'` is the one main action. Card header actions take the default (raised). `emphasis='ghost'` for row, toolbar and close actions. `intent='destructive'` (solid) inside a confirmation and in a danger zone. `intent='destructive' emphasis='subtle'` opens a confirmation. `type` defaults to `button`; a submit passes `type='submit'`. `isLoading` keeps the label's width, shows the spinner for at least 800ms and takes no second click (it stays focusable). `static` turns off the press scale. As a link: `render={<a href/>}` or a router `<Link to/>` (role `link`). Classes for a foreign element: `buttonVariants`. Joined: `ButtonGroup` + `ButtonGroupSeparator`     |
| Pressed state          | `Toggle pressed onPressedChange`: a button that stays pressed (a filter, a mark, a flag); neutral ghost, a quiet fill while pressed, sizes as `Button`. Icon only takes an `aria-label`. Never a `Button` with `aria-pressed`; a setting that applies at once is a `Switch`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Status                 | `Badge` (`intent`; `emphasis` subtle (default) · solid · outline; `size` default · sm; `shape` rounded · pill). A state is a subtle `Badge`. A dot (`StatusDot intent`) or a hue goes only next to a label that names it. A color from data: `color` instead of `intent` on either                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Notice                 | `Alert intent` (default `info`, always subtle) > `AlertContent`, `AlertAction`. No icon                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Content block          | `Card` (`intent='destructive'` for a danger card) > `CardHeader` (`actions`) · `CardTitle` · `CardDescription` > `CardContent` > `CardFooter show`. Rows: `ItemList` > `Item` (`selected`) > `ItemMedia`, `ItemContent` (`ItemTitle` one line, truncated, beside a badge its text in a `span`; `ItemDescription`), `ItemActions`, in `CardContent className='overflow-hidden'`. A link row (`render={<a/>}`) ends in `ItemChevron`. Loading: `ItemListSkeleton rows media description` in the list's place. A long list: `ItemList virtualized items itemKey` (give it a height, or `scrollElement` to scroll with the page) with the row as a function of the item; `hasMore` + `onLoadMore` + `isLoadingMore` page it                                        |
| Records                | `Table` (`variant` default · `card` in a `Card` · `flush` in `CardContent`); `TableRow selected`. A sortable column: `TableHead sort onSort` (the call site sorts). Groups: `TableGroupRow colSpan`, `open` + `onOpenChange` fold it (the call site leaves out a closed group's rows). A row that opens a page: `TableRowLink` in one cell. A long table: `Table virtualized items itemKey header` (give it a height, or `scrollElement` to scroll with the page) with the row as a function of the item; `hasMore` + `onLoadMore` + `isLoadingMore` page it                                                                                                                                                                                                   |
| Tabs                   | Panels: `Tabs` > `TabsList` > `TabsTrigger value` + `TabsContent`. Page links: `TabsNav` > `TabsLink current`. A single choice: `TabsRadioGroup value onValueChange` > `TabsRadio`. `variant` `segmented` (views) · `underline` (sections in a card) · `pill` (filters, the radio default)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Navigation             | `Sidebar` (`SidebarProvider`, `SidebarMenuButton current emphasis`, `SidebarTrigger`, `useSidebar`); on a phone `BottomNav` (floats on the inverse surface, `fixed`; the panel keeps `pb-24`) > `BottomNavList` of 3–5 icon tabs (`BottomNavLink current`, `BottomNavMore` > `BottomNavMoreItem current` morphs the bar into a list of the rest) + `BottomNavAction`. `BottomNavProvider` around the shell lets a page's `ActionBar` dock in it; the bar morphs to fit; `Breadcrumb` > `BreadcrumbList` > `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`                                                                                                                                                                                                 |
| Fields                 | `Input`, `Textarea`, `InputGroup` (`InputGroupInput` · `InputGroupTextarea`, `InputGroupAddon`, `InputGroupText`, `InputGroupButton`), `IntegerInput`. Custom field surfaces: `inputSurfaceVariants({ scope })`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Forms                  | `FieldGroup` > `Field invalid disabled` > `FieldLabel required`, control, `FieldDescription`, `FieldError errors` (renders nothing without one). Settings row: `Field orientation='horizontal'` > `FieldContent` + control; beside an input or select the content centers on it, beside a checkbox or radio it starts on its line. Lists: `FieldSet` > `FieldLegend` (`variant` label (default): one question · legend: a heading over a section). Divider: `FieldSeparator` (children for "or"). Form in a dialog: `<form className='contents'>` around `DialogBody` + `DialogFooter`                                                                                                                                                                         |
| Choice                 | `Checkbox` (`indeterminate`), `RadioGroup` + `RadioGroupItem`, a few roomy options `ChoiceCard`, `Switch size` (applies at once), `Slider`. Checked uses `primary-solid`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Pick a value           | Values are strings; `items` are `SelectOption`s. A short list, no typing: `Select items value onValueChange` > `SelectTrigger` > `SelectValue`, `SelectContent` > `SelectItem` (`SelectGroup`, `SelectLabel`, `SelectSeparator`). Search, or a long list: `Combobox items value onValueChange` > `ComboboxInput` (or `multiple` with `ComboboxChips` > `ComboboxValue` of `ComboboxChip`s + `ComboboxChipsInput`), `ComboboxContent` > `ComboboxEmpty`, `ComboboxList` > `ComboboxItem value={item}`; `virtualized` for hundreds of items. Text outside the list: `allowCustom` on either (`Select`: `SelectCustomItem` + `SelectCustomInput`; `Combobox`: a row that takes the query). Color: `ColorPicker presets custom`. Code: `InputOTP` > `InputOTPSlot` |
| Date and time          | `DateInput` (`YYYY-MM-DD`), `TimeInput` (`HH:mm`), `Calendar mode` single · range; display `IntlDate date` (`end` for a range, `relative`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Popups                 | `Popover` > `PopoverContent`. Menus: `DropdownMenu`, `ContextMenu`; a destructive item is `intent='destructive'`, last, after a separator. `Tooltip` (200ms delay; `TooltipProvider` groups neighbours). A control with a shortcut: `ShortcutTooltip label shortcut` (`['$mod+K']` together, `['G', 'P']` a chord; `$mod` is ⌘ on a Mac, Ctrl elsewhere, after hydration). Palette: `Command`, `CommandDialog title`, `CommandFooter` (result count, keys)                                                                                                                                                                                                                                                                                                     |
| Modal                  | `Dialog` > `DialogContent` > `DialogHeader`, `DialogBody`, `DialogFooter`. Every confirmation is an `AlertDialog`, never a `Dialog`. `AlertDialogAction` is a `Button`: `intent='primary'` confirms, `intent='destructive'` deletes; `AlertDialogCancel` is the default button. `Sheet` > `SheetHeader`, `SheetBody`, `SheetFooter`. Width: `DialogContent size` sm · default · lg · xl (24 · 28 · 42 · 56rem), `SheetContent size` default · lg (24 · 28rem).                                                                                                                                                                                                                                                                                                 |
| Feedback               | `toast` from `components/ui/toast` (one `ToastProvider` at the root)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Empty, failed, loading | `Empty` (`size` default · sm, `bordered`) > `EmptyMedia` (`variant` skeleton · icon), `EmptyTitle`, `EmptyDescription`, `EmptyContent`. A failure: `Empty role='alert'` with `EmptyMedia variant='icon'`. Loading: `Skeleton` (pulses in step with every other; `render={<span />}` inside a `p`), `Spinner` (in `currentColor`), `Progress` (known progress). What replaces the skeleton: `FadeIn animate={useShouldFadeIn(pending)}` (no fade for cached data)                                                                                                                                                                                                                                                                                               |
| Sequence               | `Stepper isLoading` > `StepperItem` (`StepperTitle`, `StepperDescription`), steps someone goes through. `Timeline` > `TimelineItem` (`TimelineDate`, `TimelineTitle`, `TimelineContent`), events that happened. `Accordion` for sections opened in place; `variant='flush'` for rows to the edge of a `CardContent className='overflow-hidden'` or a `SheetBody`                                                                                                                                                                                                                                                                                                                                                                                               |
| Rich text              | Rendered TipTap HTML, sanitized HTML, markdown: `Prose` (body role; h1 heading, h2–h4 body medium; `text-muted-foreground` for secondary copy). An editor's editable element: `proseVariants()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Numbers                | A big number: `Stat` > `StatLabel` + `StatValue` (title, `tabular-nums`). Charts: `ChartContainer` with `ChartTooltipContent`, `ChartLegendContent`, colors `chart-1` … `chart-5`; a `StatusDot` next to a label ties it to a series                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| People                 | `Avatar size shape` > `AvatarImage`, `AvatarFallback` (`getInitials`), initials on `muted`, never the brand fill. Organizations: `shape='square'`. `AvatarGroup size shape` (sets both on every child; each avatar is cut out around the next) + `AvatarGroupCount`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Selection actions      | `ActionBar open aria-label`: a floating toolbar on the inverse surface, sticky under the content; on a phone it docks in the `BottomNav`. Keep it mounted so it animates out                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Small parts            | `CopyButton value` (`label`, `copiedLabel`, `onCopied`); `Kbd`, `KbdGroup`; `Separator orientation`; `SortableItem` + `SortableItemHandle` (only the handle drags); `FileDropZone size`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Patterns

| Pattern        | Shape                                                                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmation   | A destructive action outside a danger zone: `intent='destructive' emphasis='subtle'` opens an `AlertDialog`, a destructive action confirms, a toast reports it                                                                                                                         |
| Danger zone    | The last settings card: `Card intent='destructive'` > `ItemList`. An undoable lifecycle row (unpublish, archive) gets a default button. A destructive row's button opens an `AlertDialog`; when the action can't be undone, the user types the name to confirm                         |
| Bulk selection | A checkbox column with select-all in `Table variant='card'`, and an `ActionBar open` below (docks in the `BottomNav` on a phone): the count and a ghost clear, a vertical `Separator`, then each action as a labeled button; `Delete…` (destructive + subtle) asks in an `AlertDialog` |
| List in card   | `CardContent className='overflow-hidden'` > `ItemList`. The header holds the add action; each row ends in a status and a ghost menu. A long list: `ItemList virtualized` with a height                                                                                                 |
| Page           | A back link, the title row with its actions, then sections: header `page` above the content, sections `section` apart, titles indented to the card text                                                                                                                                |

## Do / don't

- Pick an intent and an emphasis, not a color. Never Tailwind's palette (`text-green-700`) or a literal color.
- Pair each fill with its foreground. Don't use a bare intent as a fill (`bg-success`), and don't use a `/10` tint for status.
- Dim with `disabled` / `disabled-foreground`, not `opacity-50`. Field surfaces fade to `opacity-64` (no lift, no accent).
- Use a radius role, not a step or a literal; nest with `rounded-inner`. Use the elevations, not shadow literals.
- Don't add `dark:` color overrides to surfaces; fix the token instead.
- Don't mix `%` and lengths in a `calc()` that sizes a `radial-gradient` (`ellipse calc(50% + 2px)`): Chromium drops the whole value. Size it in lengths (`circle calc(var(--avatar-size)/2 + var(--avatar-gap))`).
- In arbitrary values, write the raw token (`var(--card)`), not `var(--color-card)`. `--color-*` resolves on `:root`, so it misses a nested `.dark` and `[data-surface]`.
- Don't read generator tokens (`bgShade`, `labelMuted`) in components. Promote one in `themeToCssVars` and map it in `@theme inline`. Don't add `*Thin` generator tokens: they differ between server and client.

## Quick reference

```text
intent        neutral · primary · info · success · warning · destructive
emphasis      solid · subtle · outline · ghost · raised      (intentVariants)
button        (none) neutral/raised · intent='primary' · emphasis='ghost' · intent='destructive' · destructive + subtle
text          foreground · muted-foreground · faint-foreground · disabled-foreground
type          title 28 · heading 18 · body 14 · control 14 · caption 12 · overline 10
spacing       tight 4 · related 8 · group 16 · card 20 · page 32 · section 48
radius        control-xs 4 · control-sm 8 · control 10 · control-lg 12 · popup 16 · card 20 · dialog 20 · panel 20 · rounded-inner
elevation     shadow-border · shadow-field · shadow-card · shadow-raised · shadow-popup · shadow-modal
block         Card > CardHeader > CardContent [> ItemList [virtualized]]
modal         DialogContent > DialogHeader · DialogBody · DialogFooter (muted band)
motion        duration-enter 100 · feedback 150 · move 200 · modal 150 · ease-enter · ease-move
values        value + onValueChange · dates YYYY-MM-DD · options SelectOption
locale        LocaleProvider locale timeZone labels (root) · a prop wins · else en-US, English
data color    Badge color · StatusDot color (exclusive with intent) · var(--category-1 … 8)
new color     themeToCssVars + @theme inline, never a literal
```
