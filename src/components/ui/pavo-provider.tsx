import * as React from 'react';

import { type LinkComponent, LinkProvider } from '~/components/ui/link';
import { LocaleProvider } from '~/components/ui/locale';
import { ToastProvider } from '~/components/ui/toast';
import { TooltipProvider } from '~/components/ui/tooltip';

type PavoProviderProps = React.ComponentProps<typeof LocaleProvider> & {
  /** The router's link, for every linking part (`LinkProvider`). Unset: plain `<a>`. */
  link?: LinkComponent;
};

/**
 * Everything an app sets once, at its root: the locale, time zone and labels (`LocaleProvider`), the router's link
 * (`LinkProvider`), one tooltip delay group (`TooltipProvider`: after the first tooltip, its neighbours open at once)
 * and the toast stack (`ToastProvider`).
 */
function PavoProvider({ link, children, ...locale }: PavoProviderProps) {
  return (
    <LocaleProvider {...locale}>
      <LinkProvider component={link ?? null}>
        <TooltipProvider>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
      </LinkProvider>
    </LocaleProvider>
  );
}

export { PavoProvider, type PavoProviderProps };
