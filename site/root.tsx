import { StrictMode } from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';

import { ToastProvider } from '~/components/ui/toast';

import { UiConfigProvider } from '~/lib/ui-config';

import { App } from './app';
import { RouterProvider } from './router';

/** The whole docs app; the same tree is prerendered (`entry-server.tsx`) and hydrated (`main.tsx`). */
export function Root({ pathname }: { pathname: string }) {
  return (
    <StrictMode>
      <UiConfigProvider>
        {/* react-aria's date and time segments follow this locale. */}
        <I18nProvider locale='de'>
          <RouterProvider initialPathname={pathname}>
            <App />
          </RouterProvider>
          <ToastProvider />
        </I18nProvider>
      </UiConfigProvider>
    </StrictMode>
  );
}
