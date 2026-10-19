import { Button } from '~/components/ui/button';

import { toast } from '~/lib/toast/toast';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Loading spins and stays open until its id is updated to success or error. */
export function ToastLoading() {
  return (
    <Button
      type='button'
      intent='neutral'
      emphasis='raised'
      onClick={() => {
        const id = toast.loading('Antrag wird übernommen …');
        void wait(1500).then(() => toast.success('Antrag übernommen', { id }));
      }}>
      Antrag übernehmen
    </Button>
  );
}
