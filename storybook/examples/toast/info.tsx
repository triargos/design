import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** Something changed underneath. */
export function ToastInfo() {
  return <Button onClick={() => toast.info('A newer version of this document is available')}>Check for updates</Button>;
}
