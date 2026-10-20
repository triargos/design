import * as Alchemy from 'alchemy';
import * as Cloudflare from 'alchemy/Cloudflare';
import * as GitHub from 'alchemy/GitHub';
import * as Output from 'alchemy/Output';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

export default Alchemy.Stack(
  'triargos-design',
  {
    providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;

    // Docs site + registry JSON (/r/registry.json, /r/{name}.json) as one assets-only Worker. vite.config.ts runs
    // `shadcn build`, then prerenders every page (/button → button.html). Unknown paths, /r/* included, get 404.html
    // with a 404 status.
    const site = yield* Cloudflare.Website.Vite('Website', {
      assets: { notFoundHandling: '404-page' },
      // Custom domain on prod only; PR previews stay on workers.dev.
      domain: stage === 'prod' ? 'design.a-np.de' : undefined,
    });

    const github = yield* GitHub.GitHubEnv;
    if (github?.pr) {
      yield* GitHub.Comment('preview-comment', {
        owner: github.owner,
        repository: github.repository,
        issueNumber: github.pr,
        body: Output.interpolate`
          ## Preview deployed

          **Site:** ${site.url}
          **Registry:** ${site.url}/r/registry.json

          Built from ${github.sha.slice(0, 7)}. Updates on every push.
        `,
      });
    }

    return {
      url: site.url,
      registry: Output.interpolate`${site.url}/r/registry.json`,
    };
  }),
);
