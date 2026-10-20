import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** One action at most; a toast with an action stays open (`timeout: 0`) when the user must decide. */
export function ToastWithAction() {
  return (
    <Button
      onClick={() =>
        toast('Draft restored', {
          timeout: 0,
          action: { label: 'Discard', onClick: () => toast.dismiss() },
        })
      }>
      Restore draft
    </Button>
  );
}
