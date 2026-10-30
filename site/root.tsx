import { StrictMode } from 'react';

import { PavoProvider } from '~/components/ui/pavo-provider';

import { App } from './app';
import { RouterProvider } from './router';

/** The whole docs app; the same tree is prerendered (`entry-server.tsx`) and hydrated (`main.tsx`). */
export function Root({ pathname }: { pathname: string }) {
  return (
    <StrictMode>
      <PavoProvider locale='en-US'>
        <RouterProvider initialPathname={pathname}>
          <App />
        </RouterProvider>
      </PavoProvider>
    </StrictMode>
  );
}
