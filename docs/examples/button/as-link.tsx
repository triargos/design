import { ArrowRightIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

/** `render` swaps the element, e.g. for a router link. */
export function ButtonAsLink() {
  return (
    <Button render={<a href='#settings' />}>
      Open settings
      <ArrowRightIcon data-icon='inline-end' />
    </Button>
  );
}
