import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** `toast.promise`: loading, then success or error in place. */
export function ToastPromise() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() => {
        void toast
          .promise(
            wait(1500).then(() => Promise.reject(new Error('offline'))),
            { loading: 'Datei wird hochgeladen …', success: 'Datei hochgeladen', error: 'Upload fehlgeschlagen' },
          )
          .catch(() => undefined);
      }}>
      Datei hochladen
    </Button>
  );
}
