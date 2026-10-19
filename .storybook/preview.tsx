import { RouterProvider, createMemoryRouter } from 'react-router';

import {
  DEFAULT_ORGANIZATION_BRANDING_THEME,
  OrganizationBrandingBaseColor,
  OrganizationBrandingDestructiveColor,
  OrganizationBrandingPrimaryColor,
} from '@elternportal/domain/organization-branding';

import { DecoratorHelpers } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import { createInstance, type Resource } from 'i18next';
import { type ReactNode, createContext, use, useState } from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { ToastProvider } from '~/components/ui/toast';

import { i18nClient } from '~/modules/translation/i18n-client.ts';

import { DEFAULT_TOKEN_GLOBALS } from '../storybook/kit/tokens';
import '~/inter.css';

import './preview.css';
import { FRAME_MODES, FRAME_SURFACES, Frame, frameSettings } from './frame';

const localeModules = import.meta.glob<Record<string, unknown>>('../public/locales/de/*.json', {
  eager: true,
  import: 'default',
});

const namespaceOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1, -'.json'.length);

const resources: Resource = {
  de: Object.fromEntries(Object.entries(localeModules).map(([path, messages]) => [namespaceOf(path), messages])),
};

const i18n = createInstance();
await i18n.use(initReactI18next).init({ ...i18nClient, lng: 'de', resources });

// Registers the modes with addon-themes' toolbar; `Frame` applies them.
DecoratorHelpers.initializeThemeState([...FRAME_MODES], 'light');

/** What `root.tsx`'s loader gives components that read it (`useLocale`, `useRouteLoaderData('root')`). */
const ROOT_LOADER_DATA = { locale: 'de' };

const StoryContent = createContext<ReactNode>(null);

const StoryRoute = () => use(StoryContent);

/**
 * A data router with the app's `root` route, so hooks that need one work in stories: `useRouteLoaderData('root')`
 * (`IntlDate`), `useNavigation` (`UnsavedChangesToast`). The story reaches the route through context, so a re-render
 * (a toolbar change) does not rebuild the router.
 */
function StoryRouter({ children }: { children: ReactNode }) {
  const [router] = useState(() =>
    createMemoryRouter([{ id: 'root', path: '*', loader: () => ROOT_LOADER_DATA, Component: StoryRoute }], {
      hydrationData: { loaderData: { root: ROOT_LOADER_DATA } },
    }),
  );
  return (
    <StoryContent value={children}>
      <RouterProvider router={router} />
    </StoryContent>
  );
}

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
      <I18nextProvider i18n={i18n}>
        {/* `root.tsx` sets the react-aria locale the same way: date and time segments follow it. */}
        <I18nProvider locale='de'>
          <StoryRouter>
            <Frame settings={frameSettings(context.globals, context.parameters)}>
              <Story />
            </Frame>
            {/* As in `root.tsx`: one toast viewport for the app, outside the frame so side by side does not double it. */}
            <ToastProvider />
          </StoryRouter>
        </I18nProvider>
      </I18nextProvider>
    ),
  ],
  // The organization picks these three names (`OrganizationBrandingTheme`); `brandingThemeCss` turns them into tokens.
  globalTypes: {
    primaryColor: brandToolbar('Primary', 'circle', OrganizationBrandingPrimaryColor.literals),
    baseColor: brandToolbar('Base', 'circlehollow', OrganizationBrandingBaseColor.literals),
    destructiveColor: brandToolbar('Destructive', 'alert', OrganizationBrandingDestructiveColor.literals),
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
    ...DEFAULT_ORGANIZATION_BRANDING_THEME,
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
