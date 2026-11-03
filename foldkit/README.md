# Pavo on Foldkit (experiment)

Pavo's components rebuilt on [Foldkit](https://github.com/foldkit/foldkit) and `@foldkit/ui`, with a showcase app.

```sh
pnpm install            # at the repo root
cd foldkit && pnpm dev  # http://localhost:5173 (pass --port to pin it)
pnpm typecheck          # runs pnpm generate first
```

## What is shared, what is rewritten

| Shared with the React kit (imported from `../src`)                 | Rewritten here (`src/pavo/`)                   |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `src/tailwind.css` tokens, roles, utilities; `src/inter.css`       | Every component: markup, attributes, behaviour |
| `cn` (`src/lib/utils.ts`), `intentVariants` (`intent-variants.ts`) | Pages of the showcase (`src/pages/`)           |
| Theme generator (`src/lib/theme/*`), rendered into a `<style>`     |                                                |

## Layout

| Path                  | Holds                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/pavo/<c>.ts`     | One component per React file (`button.tsx` → `button.ts`). Imports only `src/pavo/*`, `foldkit`, `@foldkit/ui`, `effect`. |
| `src/pages/<slug>.ts` | The showcase page for a component. Slug = the React docs slug (`alert-dialog`).                                           |
| `src/kit.ts`          | Page blocks: `page`, `exampleSection`, `foundationSection`, `code`, `row`.                                                |
| `src/main.ts`         | App shell: routing, sidebar, colour scheme, primary colour.                                                               |
| `*.generated.ts`      | `scripts/pages.mjs` (page registry, routes, folds) and `scripts/icons.mjs` (used Tabler icons).                           |

## Component conventions

- Import a component as a namespace: `import * as Card from '../pavo/card.ts'`. Parts are functions named for the part: `Card.view`, `Card.header`, `Card.title`, `Card.content`.
- A part is `(config, h) => Html`, the order `@foldkit/ui` uses. Its config extends `PartConfig<Message>` (`src/pavo/part.ts`): `className`, `attributes`, `children`. Props from React become config fields: `intent`, `emphasis`, `size`; booleans take `is`/`has` (`isDisabled`, `isPending`, `hasDescription`).
- Every part sets `data-slot` (`h.DataAttribute('slot', 'card-header')`) and writes its classes inline, copied from the React file, merged with `cn(…, className)`.
- `h.Class` replaces, it does not merge: the last one wins. A part emits exactly one `h.Class`. Callers pass classes through `className`, never `h.Class` inside `attributes`.
- `@foldkit/ui` marks state with data attributes: `data-disabled`, `data-checked`, `data-closed`, `data-enter`, `data-leave`, `data-transition`, `data-active`, `data-selected`. Translate Base UI variants: `disabled:` → `data-disabled:`, `data-open:animate-in`/`data-closed:animate-out` keyframes → transitions on `data-closed:` (see `dialog.ts`).
- Stateless components (Button, Badge, Card, Input, Checkbox, Switch…) are plain view functions. Where `@foldkit/ui` has a render helper (Button, Input, Textarea, Checkbox, Switch, Select, Fieldset, Disclosure, Progress), build on it for the attributes.
- Stateful components wrap a `@foldkit/ui` Submodel (Dialog, Menu, Listbox, Combobox, Popover, Tooltip, Tabs, RadioGroup, Slider, Calendar, DatePicker, Toast, FileDrop, DragAndDrop). The Pavo module re-exports `Model`, `Message`, `OutMessage`, `init`, `update` and the entry points (`open`, `close`, …), and adds a styled `view(config, h)` that calls `h.submodel` with a `toView`. `dialog.ts` is the reference.
- The parent owns the state: it stores the child Model, wraps its Messages (`Got<X>Message`), folds with `Update.foldChild` and `foldOutMessage`, opens and closes through `foldChildStep` (`pages/dialog.ts`).
- Built-in labels (`closeLabel`, `clearLabel`, …) are config fields with the English default as a constant. There is no locale context; formatting components take `locale` (default `'en-US'`) and `timeZone`.
- Icons: `icon('x', { className, dataIcon })` from `src/pavo/icon.ts`, Tabler names. `pnpm generate` collects the names used in `src`.
- No comments. Foldkit's conventions apply (`/tmp/foldkit/AGENTS.md`): Messages are past-tense facts, Commands imperatives, `Option` for absence, `Schema` types, no `switch`, no `T[]`.

## Page contract

`src/pages/<slug>.ts` exports `title`, `description`, `Model`, `Message`, `init(context: PageContext)`, `update`, `view` (`Submodel.defineView<Model, Message>`), and optionally `subscriptions` (a record for `Subscription.lift`; prefix each key with the page name, `sliderVolumePointer`). `pnpm generate` wires it into routes, the sidebar, init, update and subscriptions. The page ports the React docs page's example sections (`docs/components/<slug>.tsx`, `docs/examples/<slug>/*.tsx`) in the same order and copy.

## Not ported

- `locale.tsx`, `pavo-provider.tsx`: React context. Foldkit passes values explicitly.
- `hooks/use-overlay.ts` (`closeOverlays` on navigation): the app closes its Dialog Models in the route-change update.
- `hooks/use-accessible-name-check.ts`: development warning only.
