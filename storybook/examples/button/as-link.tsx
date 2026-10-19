import { ArrowRightIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

/** `render` swaps the element; in the app it is a router `<Link>`. */
export function ButtonAsLink() {
  return (
    <Button intent='neutral' emphasis='raised' render={<a href='#einstellungen' />}>
      Zu den Einstellungen
      <ArrowRightIcon data-icon='inline-end' />
    </Button>
  );
}
