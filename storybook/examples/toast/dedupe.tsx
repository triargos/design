import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/**
 * The same toast again updates the open one, restarts its timer and replays a pulse (a shake for errors), instead of
 * stacking a copy. Keyed by type, title and description.
 */
export function ToastDedupe() {
  return (
    <Button type='button' intent='neutral' emphasis='raised' onClick={() => toast.error('Speichern fehlgeschlagen')}>
      Zweimal klicken
    </Button>
  );
}
