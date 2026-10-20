import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

/** Neutral news. Toasts stack bottom right, close after 5 seconds and pause while hovered. */
export function ToastDefault() {
  return <Button onClick={() => toast('Draft restored')}>Restore draft</Button>;
}
