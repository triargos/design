import { CopyButton } from '~/components/ui/copy-button';

export function CopyButtonWithText() {
  return (
    <CopyButton value='JBSWY3DPEHPK3PXP' size='sm' emphasis='raised'>
      {(copied) => (copied ? 'Kopiert' : 'Schlüssel kopieren')}
    </CopyButton>
  );
}
