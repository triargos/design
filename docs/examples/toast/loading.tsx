import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Loading spins and stays open until its id is updated to success or error. */
export function ToastLoading() {
  return (
    <Button
      onClick={() => {
        const id = toast.loading('Importing tasks…');
        void wait(1500).then(() => toast.success('Tasks imported', { id }));
      }}>
      Import tasks
    </Button>
  );
}
