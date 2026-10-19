import {
  DEFAULT_BRANDING_THEME,
  BRAND_BASE_COLORS,
  BRAND_DESTRUCTIVE_COLORS,
  BRAND_PRIMARY_COLORS,
} from '~/lib/theme/branding';

import { DecoratorHelpers } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import type { MouseEvent } from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';

import { ToastProvider } from '~/components/ui/toast';

import { UiConfigProvider } from '~/lib/ui-config';

import { DEFAULT_TOKEN_GLOBALS } from '../storybook/kit/tokens';
import '~/inter.css';

import './preview.css';
import { FRAME_MODES, FRAME_SURFACES, Frame, frameSettings } from './frame';

/**
 * Examples link with real paths (`href='/members'`); a click would navigate the preview iframe away. Hash links and
 * external URLs still work.
 */
const stayOnStory = (event: MouseEvent<HTMLDivElement>) => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="/"]') : null;
  if (link) event.preventDefault();
};

// Registers the modes with addon-themes' toolbar; `Frame` applies them.
DecoratorHelpers.initializeThemeState([...FRAME_MODES], 'light');

const brandToolbar = (title: string, icon: 'circle' | 'circlehollow' | 'alert', literals: ReadonlyArray<string>) => ({
  toolbar: {
    title,
    icon,
    items: literals.map((value) => ({ value, title: value, right: title })),
    dynamicTitle: true,
  },
});

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <UiConfigProvider locale='de'>
        {/* react-aria's date and time segments follow this locale. */}
        <I18nProvider locale='de'>
          <div className='contents' onClickCapture={stayOnStory}>
            <Frame settings={frameSettings(context.globals, context.parameters)}>
              <Story />
            </Frame>
          </div>
          {/* One toast viewport, outside the frame so side by side does not double it. */}
          <ToastProvider />
        </I18nProvider>
      </UiConfigProvider>
    ),
  ],
  // A theme is these three names (`BrandingTheme`); `brandingThemeCss` turns them into tokens.
  globalTypes: {
    primaryColor: brandToolbar('Primary', 'circle', BRAND_PRIMARY_COLORS),
    baseColor: brandToolbar('Base', 'circlehollow', BRAND_BASE_COLORS),
    destructiveColor: brandToolbar('Destructive', 'alert', BRAND_DESTRUCTIVE_COLORS),
    surface: {
      toolbar: {
        title: 'Surface',
        icon: 'box',
        items: FRAME_SURFACES.map((value) => ({ value, title: `On ${value}` })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    ...DEFAULT_BRANDING_THEME,
    surface: 'page',
    // Tuned in the Tokens panel (`manager.ts`); `Frame` writes them over `tailwind.css`.
    ...DEFAULT_TOKEN_GLOBALS,
  },
  parameters: {
    layout: 'fullscreen',
    frame: 'centered',
    options: {
      // Foundations in reading order, then Components and Patterns A–Z, one entry per `components/ui` file. In an entry:
      // Board, Playground, then the examples in page order (export order). Self-contained: Storybook runs it apart.
      // @ts-expect-error -- Storybook evals this source as plain JS, so no annotations; `parameters` is untyped.
      storySort: (a, b) => {
        const groups = ['Foundations', 'Components', 'Patterns'];
        const foundations = ['Color', 'Typography', 'Spacing', 'Surfaces', 'Shape', 'Loading', 'Interaction', 'Motion'];
        const [groupA = '', entryA = ''] = a.title.split('/');
        const [groupB = '', entryB = ''] = b.title.split('/');
        if (groupA !== groupB) return groups.indexOf(groupA) - groups.indexOf(groupB);
        if (entryA !== entryB) {
          return groupA === 'Foundations'
            ? foundations.indexOf(entryA) - foundations.indexOf(entryB)
            : entryA.localeCompare(entryB, 'en');
        }
        const [rankA = 2, rankB = 2] = [a.name, b.name].map((name) =>
          name === 'Board' ? 0 : name === 'Playground' ? 1 : 2,
        );
        return rankA - rankB;
      },
    },
  },
};

export default preview;
