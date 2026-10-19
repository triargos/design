import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

/** Done, with a catch. */
export function ToastWarning() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() => toast.warning('Veröffentlicht, 2 Regeln ausgelassen')}>
      Veröffentlichen
    </Button>
  );
}
