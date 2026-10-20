import { StrictMode } from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';

import { ToastProvider } from '~/components/ui/toast';

import { App } from './app';
import { RouterProvider } from './router';

/** The whole docs app; the same tree is prerendered (`entry-server.tsx`) and hydrated (`main.tsx`). */
export function Root({ pathname }: { pathname: string }) {
  return (
    <StrictMode>
      {/* react-aria's date and time segments follow this locale. */}
      <I18nProvider locale='en-US'>
        <RouterProvider initialPathname={pathname}>
          <App />
        </RouterProvider>
        <ToastProvider />
      </I18nProvider>
    </StrictMode>
  );
}
