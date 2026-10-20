import { CopyButton } from '~/components/ui/copy-button';
import { LocaleProvider } from '~/components/ui/locale';

/** A prop on the component wins over the provider. */
export function LocaleOverride() {
  return (
    <LocaleProvider locale='de-DE' labels={{ copy: 'Kopieren', copied: 'Kopiert' }}>
      <div className='flex items-center gap-related'>
        <CopyButton value='INV-2025-0042' />
        <CopyButton value='https://example.com/invoices/42' label='Link kopieren' />
      </div>
    </LocaleProvider>
  );
}
