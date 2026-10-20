import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** Saved, sent, done. */
export function ToastSuccess() {
  return <Button onClick={() => toast.success('Changes saved')}>Save</Button>;
}
