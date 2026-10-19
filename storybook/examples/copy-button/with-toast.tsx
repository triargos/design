import { CopyButton } from '~/components/ui/copy-button';

import { toast } from '~/lib/toast/toast';

/** `onCopied` for a copy whose result is not next to the button. */
export function CopyButtonWithToast() {
  return (
    <CopyButton
      value='ep_live_4f9a2b7dc21e'
      label='API-Schlüssel kopieren'
      emphasis='raised'
      size='sm'
      onCopied={() => toast.success('API-Schlüssel kopiert')}>
      API-Schlüssel kopieren
    </CopyButton>
  );
}
