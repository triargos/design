import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** `toast.promise`: loading, then success or error in place. */
export function ToastPromise() {
  return (
    <Button
      onClick={() => {
        void toast
          .promise(
            wait(1500).then(() => Promise.reject(new Error('offline'))),
            { loading: 'Uploading invoice…', success: 'Invoice uploaded', error: 'Upload failed' },
          )
          .catch(() => undefined);
      }}>
      Upload invoice
    </Button>
  );
}
