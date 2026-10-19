import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** Saved, sent, done. */
export function ToastSuccess() {
  return (
    <Button type='button' intent='neutral' emphasis='raised' onClick={() => toast.success('Änderungen gespeichert')}>
      Speichern
    </Button>
  );
}
