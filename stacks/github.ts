// Mints a scoped Cloudflare API token for CI and writes it to triargos/design
// as Actions secrets. Deploy once, locally, with a profile that can create
// API tokens (API token/Global key, not OAuth):
//
//   pnpm exec alchemy deploy --config stacks/github.ts --profile triargos-admin
import * as Alchemy from 'alchemy';
import * as Cloudflare from 'alchemy/Cloudflare';
import * as GitHub from 'alchemy/GitHub';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Redacted from 'effect/Redacted';

const repo = { owner: 'triargos', repository: 'design' } as const;

export default Alchemy.Stack(
  'triargos-design-github',
  {
    providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;

    const token = yield* Cloudflare.ApiToken.AccountApiToken('CIToken', {
      accountId,
      policies: [
        {
          effect: 'allow',
          permissionGroups: [
            'Workers Scripts Write',
            'Account Settings Write',
            'Secrets Store Write',
            'Workers Tail Read',
          ],
          resources: { [`com.cloudflare.api.account.${accountId}`]: '*' },
        },
      ],
    });

    yield* GitHub.Secret('cf-api-token', {
      ...repo,
      name: 'CLOUDFLARE_API_TOKEN',
      value: token.value,
    });

    yield* GitHub.Secret('cf-account-id', {
      ...repo,
      name: 'CLOUDFLARE_ACCOUNT_ID',
      value: Redacted.make(accountId),
    });
  }),
);
