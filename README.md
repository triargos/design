# Triargos Design

shadcn registry for Triargos, plus a preview site. Deployed to Cloudflare with [Alchemy](https://alchemy.run).

- Catalog: `/r/registry.json`
- Items: `/r/{name}.json`

## Use the registry

```sh
pnpm dlx shadcn@latest registry add @triargos=https://<host>/r/{name}.json
pnpm dlx shadcn@latest add @triargos/<item>
```

## Develop

```sh
pnpm install
pnpm dev          # alchemy dev, stage dev_$USER: the docs site with hot reload
pnpm typecheck
pnpm format       # oxfmt; `pnpm format:check` to verify
pnpm deploy       # personal cloud stage live_$USER
```

`.env` sets `ALCHEMY_PROFILE=triargos` (Cloudflare account `5df6eb…`).

### Layout

- `src/components/ui/` the components, `src/lib/` and `src/hooks/` their helpers, `src/tailwind.css` the tokens.
- `docs/` the docs site's content; `site/` the site itself (router, nav, Playground, Customize).
  - `docs/{foundations,components,patterns}/<slug>.tsx` one page each: a default export of `defineDocs({ title, description, group, playground?, Page })` (`docs/kit/docs.ts`).
  - `docs/examples/<slug>/<section>.tsx` the examples a page shows, with their source under "Show code"; a pattern's in `docs/examples/patterns/<slug>/`.
  - `docs/kit/` the page blocks (`FoundationPage`, `ExampleSection`, `Matrix`, …).

### Add a component

1. `src/components/ui/<c>.tsx`, and an item in `registry.json`.
2. `docs/components/<c>.tsx`: `defineDocs` with a `Page` of `ExampleSection`s, one per example; add `playground` (`component`, `args`, `argTypes`) for a live props editor.
3. `docs/examples/<c>/<section>.tsx`: one named export `<C><Section>`, real usage; it imports app code and packages only, never `docs/kit`, so a registry can ship it as a block.

Pages are found by directory: no index to update.

Registry items live in `registry.json` (use `include` to split). `vite.config.ts` runs `shadcn build` into `public/r` before every build, so deploys always ship fresh JSON.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`):

- push to `main` → stage `prod`
- pull request → stage `pr-<n>`, URL posted as a PR comment, destroyed on close

CI secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) are managed by `stacks/github.ts`.
