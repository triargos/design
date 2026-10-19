import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** Neutral news. Toasts stack bottom right, close after 5 seconds and pause while hovered. */
export function ToastDefault() {
  return (
    <Button type='button' intent='neutral' emphasis='raised' onClick={() => toast('Entwurf wiederhergestellt')}>
      Entwurf wiederherstellen
    </Button>
  );
}
