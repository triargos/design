import { CopyButton } from '~/components/ui/copy-button';
import { toast } from '~/components/ui/toast';

/** `onCopied` for a copy whose result is not next to the button. */
export function CopyButtonWithToast() {
  return (
    <CopyButton value='sk_live_4f9a2b7dc21e' emphasis='raised' onCopied={() => toast.success('API key copied')}>
      Copy API key
    </CopyButton>
  );
}
