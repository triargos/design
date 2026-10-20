import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** Done, with a catch. */
export function ToastWarning() {
  return <Button onClick={() => toast.warning('Published, 2 tasks skipped')}>Publish</Button>;
}
