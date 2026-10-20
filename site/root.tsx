import { StrictMode } from 'react';

import { LocaleProvider } from '~/components/ui/locale';
import { ToastProvider } from '~/components/ui/toast';

import { App } from './app';
import { RouterProvider } from './router';

/** The whole docs app; the same tree is prerendered (`entry-server.tsx`) and hydrated (`main.tsx`). */
export function Root({ pathname }: { pathname: string }) {
  return (
    <StrictMode>
      <LocaleProvider locale='en-US'>
        <RouterProvider initialPathname={pathname}>
          <App />
        </RouterProvider>
        <ToastProvider />
      </LocaleProvider>
    </StrictMode>
  );
}
