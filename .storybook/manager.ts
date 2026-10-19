import { createElement as h, type ChangeEvent } from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { addons, types, useGlobals } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

import { formatToken, TOKEN_GROUPS, type TokenGroup, tokenValue } from '../storybook/kit/tokens';

// Storybook's own UI, in the dashboard's default branding (blue on zinc). The manager cannot load the app's CSS,
// so these are literal values.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Triargos · Design system',
    fontBase: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
    fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    colorPrimary: '#155cfb',
    colorSecondary: '#155cfb',
    appBg: '#eeeef0',
    appContentBg: '#f8f8fa',
    appPreviewBg: '#f8f8fa',
    appBorderColor: 'rgba(0, 0, 0, 0.08)',
    appBorderRadius: 16,
    barBg: '#f8f8fa',
    inputBorderRadius: 12,
  }),
});

/**
 * One section per scale, one slider per token. The values are globals, so they hold across stories and land in the
 * URL; `Frame` (`frame.tsx`) writes them over `tailwind.css`. Plain `createElement`: the manager bundle compiles JSX
 * classically.
 */
function TokenSection({ group }: { group: TokenGroup }) {
  const [globals, updateGlobals] = useGlobals();
  const tuned = group.tokens.some((token) => tokenValue(globals, token) !== token.defaultValue);
  const reset = () =>
    updateGlobals(Object.fromEntries(group.tokens.map((token) => [token.global, token.defaultValue])));

  return h(
    'section',
    { style: { display: 'grid', gap: 10, alignContent: 'start' } },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
      h('span', { style: { fontWeight: 500 } }, group.title),
      h('button', { type: 'button', disabled: !tuned, onClick: reset }, 'Reset'),
    ),
    ...group.tokens.map((token) => {
      const value = tokenValue(globals, token);
      const isDefault = value === token.defaultValue;
      return h(
        'label',
        {
          key: token.global,
          style: { display: 'grid', gridTemplateColumns: '7.5rem 1fr 7.5rem', alignItems: 'center', gap: 10 },
        },
        h('span', { style: { fontFamily: 'ui-monospace, monospace' } }, token.label),
        h('input', {
          type: 'range',
          min: token.min,
          max: token.max,
          step: token.step,
          value,
          onChange: (event: ChangeEvent<HTMLInputElement>) =>
            updateGlobals({ [token.global]: Number(event.target.value) }),
        }),
        h(
          'span',
          { style: { fontVariantNumeric: 'tabular-nums', opacity: isDefault ? 0.6 : 1 } },
          isDefault
            ? formatToken(token, value)
            : `${formatToken(token, value)} (${formatToken(token, token.defaultValue)})`,
        ),
      );
    }),
  );
}

function TokensPanel() {
  return h(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
        gap: 32,
        padding: 16,
        fontSize: 13,
      },
    },
    ...TOKEN_GROUPS.map((group) => h(TokenSection, { key: group.title, group })),
  );
}

addons.register('triargos/tokens', () => {
  addons.add('triargos/tokens/panel', {
    type: types.PANEL,
    title: 'Tokens',
    render: ({ active }) => h(AddonPanel, { active: active ?? false, children: h(TokensPanel) }),
  });
});
