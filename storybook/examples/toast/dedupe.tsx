import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/**
 * The same toast again updates the open one, restarts its timer and replays a pulse (a shake for errors), instead of
 * stacking a copy. Keyed by type, title and description.
 */
export function ToastDedupe() {
  return <Button onClick={() => toast.error('Couldn’t save changes')}>Click twice</Button>;
}
