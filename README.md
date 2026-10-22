# Triargos Design

The design system behind Triargos products: React components, tokens and patterns, shipped as a [shadcn](https://ui.shadcn.com) registry.

**[design.a-np.de](https://design.a-np.de)**: every component live, with its code.

- 50+ components on [Base UI](https://base-ui.com) and [React Aria](https://react-spectrum.adobe.com/react-aria/), styled with Tailwind CSS v4.
- One vocabulary for every prop: `intent` × `emphasis`, `size`, surfaces, type roles, spacing, radius, elevation and motion. See [DESIGN.md](DESIGN.md).
- A theme generator: pick a primary, base and destructive color, get the full light and dark palette.
- Foundations (color, typography, spacing, surfaces, shape, motion) and patterns (bulk selection, confirmation, danger zone, …).

## Install a component

Add the registry once per project, then add components by name:

```sh
pnpm dlx shadcn@latest registry add @triargos=https://design.a-np.de/r/{name}.json
pnpm dlx shadcn@latest add @triargos/button
```

The code is copied into your project; `add` again to update it. Each component page on the site shows its install command.

- Catalog: [`/r/registry.json`](https://design.a-np.de/r/registry.json)
- Item: `/r/{name}.json`, with `meta.commit`: the commit it was built from

The paths below follow the app's `components.json` aliases (`~/lib` is `src/lib` or `app/lib`).

- `theme` writes the generator to `lib/theme/*.ts` and the tokens to `lib/theme/triargos.css`. The tokens hold no Tailwind: import them in the app's own stylesheet, after Tailwind and tw-animate-css:

  ```css
  @import 'tailwindcss';
  @import 'tw-animate-css';
  @import './lib/theme/triargos.css'; /* from app/tailwind.css or src/index.css */
  ```

  Render `brandingThemeCss(theme)` (`lib/theme/branding-theme.ts`) into a `<style>` for the colors.

- Sizing (`lib/theme/sizing.ts`): pick a style, or a density and a radius, and render `sizingThemeCss` next to the colors. It writes only what differs from `triargos.css`, and a style's phone values under `@media (width < 40rem)`:

  ```tsx
  import { scaleDensity, SIZING_STYLES, sizingThemeCss } from '~/lib/theme/sizing';

  // The whole app: a style, or the two axes.
  <style>{sizingThemeCss(SIZING_STYLES.coss)}</style>
  <style>{sizingThemeCss({ density: 'compact', radius: 'pill' })}</style>
  <style>{sizingThemeCss({ density: scaleDensity(0.9), radius: 'default' })}</style>

  // One subtree.
  <style>{sizingThemeCss(SIZING_STYLES.dense, '[data-sizing=dense]')}</style>
  <div data-sizing='dense'>…</div>
  ```

  Styles: `triargos` (default), `coss`, `dense`, `soft`. Densities: `compact`, `default`, `comfortable`. Radii: `sharp`, `default`, `soft`, `pill`. A density of your own: `scaleDensity(factor)` or any map of token to px; `SIZING_TOKENS` lists every token with what it tunes. A theme's `tokens` add any token on top (DESIGN.md, Sizing).

- The registry owns `lib/utils.ts` (`utils`, imported as `~/lib/utils` by every component), `lib/theme/*` with its CSS (`theme`), `hooks/use-mobile.ts` and `components/ui/*`. `add` overwrites them. Keep the app's own helpers, hooks and styles in other files.

## Develop

Requires Node 24 and pnpm.

```sh
pnpm install
pnpm dev          # the docs site with hot reload
pnpm typecheck
pnpm format       # oxfmt; `pnpm format:check` to verify
```

`pnpm dev` and `pnpm deploy` run through [Alchemy](https://alchemy.run) and need Cloudflare credentials.

### Layout

| Path                                      | Holds                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `src/components/ui/`                      | The components, one per file                                              |
| `src/lib/`, `src/hooks/`                  | Their helpers; `src/lib/theme/` is the theme generator                    |
| `src/tailwind.css`                        | The tokens                                                                |
| `docs/{foundations,components,patterns}/` | One docs page per file: `defineDocs({ title, description, group, Page })` |
| `docs/examples/<slug>/<section>.tsx`      | The examples a page shows, with their source under "Show code"            |
| `docs/kit/`                               | Page blocks (`FoundationPage`, `ExampleSection`, `Matrix`, …)             |
| `site/`                                   | The docs site: router, nav, Playground, Customize, Install                |
| `scripts/registry.mjs`                    | Generates `registry.json` from the components' imports                    |

### Add a component

1. `src/components/ui/<c>.tsx`. Its registry item is generated from its imports.
2. `docs/components/<c>.tsx`: `defineDocs` with a `Page` of `ExampleSection`s; add `playground` (`component`, `args`, `argTypes`) for a live props editor.
3. `docs/examples/<c>/<section>.tsx`: one named export `<C><Section>`, real usage. It imports app code and packages only, never `docs/kit`, so a registry can ship it as a block.

Pages are found by directory: no index to update. `<c>` must match the registry item's name; `scripts/registry.mjs` fails otherwise.

[DESIGN.md](DESIGN.md) has the API rules and the tokens.

## Deploy

Cloudflare, as one assets-only Worker (`alchemy.run.ts`). GitHub Actions (`.github/workflows/deploy.yml`):

- push to `main` → stage `prod` at design.a-np.de
- pull request → stage `pr-<n>`, URL posted as a PR comment, destroyed on close

`vite.config.ts` regenerates `registry.json` and runs `shadcn build` into `public/r` before every build, so deploys always ship fresh JSON. `stacks/github.ts` mints the CI's Cloudflare token.

## License

[MIT](LICENSE)
