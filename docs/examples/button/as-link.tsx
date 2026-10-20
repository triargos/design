import { IconArrowRight } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';

/** `render` swaps the element, e.g. for a router link. */
export function ButtonAsLink() {
  return (
    <Button render={<a href='#settings' />}>
      Open settings
      <IconArrowRight data-icon='inline-end' />
    </Button>
  );
}
