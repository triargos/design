import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Everything Storybook shows lives in `storybook/`, outside `app/`: the app never imports it. Not under `.storybook/`:
  // Storybook's watcher skips new stories in a dot-directory.
  stories: ['../storybook/**/*.stories.tsx'],
  // Pseudo states: `parameters.pseudo` forces hover, focus and press on chosen elements (Foundations/Interaction).
  addons: ['@storybook/addon-themes', 'storybook-addon-pseudo-states'],
  // The frame paints the app's own surfaces; Storybook's backgrounds toolbar would only fight it.
  features: { backgrounds: false },
  framework: {
    name: '@storybook/react-vite',
    options: {
      // The app's vite.config.ts runs the React Router and Hono server plugins, which need a route tree.
      builder: { viteConfigPath: '.storybook/vite.config.ts' },
    },
  },
};

export default config;
