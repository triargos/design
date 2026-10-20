import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** The action failed; a description says why or what next. */
export function ToastError() {
  return (
    <Button
      onClick={() => toast.error('Couldn’t save changes', { description: 'Check your connection and try again.' })}>
      Save
    </Button>
  );
}
