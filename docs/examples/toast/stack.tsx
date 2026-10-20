import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** The newest in front, at most three shown. Hover expands the stack. */
export function ToastStack() {
  return (
    <Button
      onClick={() => {
        toast.success('Changes saved');
        toast.info('A newer version of this document is available');
        toast.error('Couldn’t save changes', { description: 'Check your connection and try again.' });
      }}>
      Show three toasts
    </Button>
  );
}
