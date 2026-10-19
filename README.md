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
pnpm dev          # alchemy dev, stage dev_$USER
pnpm deploy       # personal cloud stage live_$USER
```

`.env` sets `ALCHEMY_PROFILE=triargos` (Cloudflare account `5df6eb…`).

Registry items live in `registry.json` (use `include` to split). `vite.config.ts` runs `shadcn build` into `public/r` before every build, so deploys always ship fresh JSON.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`):

- push to `main` → stage `prod`
- pull request → stage `pr-<n>`, URL posted as a PR comment, destroyed on close

CI secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) are managed by `stacks/github.ts`.
