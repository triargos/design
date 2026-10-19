import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** The newest in front, at most three shown. Hover expands the stack. */
export function ToastStack() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() => {
        toast.success('Änderungen gespeichert');
        toast.info('Das Formular wurde aktualisiert');
        toast.error('Speichern fehlgeschlagen', { description: 'Bitte versuche es erneut.' });
      }}>
      Drei Toasts
    </Button>
  );
}
