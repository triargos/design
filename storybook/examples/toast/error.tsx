import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** The action failed; a description says why or what next. */
export function ToastError() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() => toast.error('Speichern fehlgeschlagen', { description: 'Bitte versuche es erneut.' })}>
      Speichern
    </Button>
  );
}
