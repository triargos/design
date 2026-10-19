import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** Something changed underneath. */
export function ToastInfo() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() => toast.info('Das Formular wurde aktualisiert')}>
      Formular neu laden
    </Button>
  );
}
