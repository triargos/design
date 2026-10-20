import { CopyButton } from '~/components/ui/copy-button';

export function CopyButtonWithText() {
  return (
    <CopyButton value='JBSWY3DPEHPK3PXP' emphasis='raised'>
      {(copied) => (copied ? 'Copied' : 'Copy secret key')}
    </CopyButton>
  );
}
