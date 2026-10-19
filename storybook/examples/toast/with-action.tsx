import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** One action at most; a toast with an action stays open (`timeout: 0`) when the user must decide. */
export function ToastWithAction() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() =>
        toast('Entwurf wiederhergestellt', {
          timeout: 0,
          action: { label: 'Verwerfen', onClick: () => toast.dismiss() },
        })
      }>
      Entwurf wiederherstellen
    </Button>
  );
}
