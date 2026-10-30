import { PavoProvider } from '~/components/ui/pavo-provider';

/** At the app's root, around the router. Every prop is optional. */
export function PavoProviderDefault() {
  return (
    <PavoProvider locale='de-DE' timeZone='Europe/Berlin' labels={{ close: 'Schließen' }}>
      <p className='text-body text-muted-foreground'>The app goes here.</p>
    </PavoProvider>
  );
}
