import { ChevronDownIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

/** Buttons that act on one thing; inner corners go square. */
export function ButtonGroupDefault() {
  return (
    <ButtonGroup>
      <Button size='sm'>Preview</Button>
      <Button size='sm'>Download</Button>
      <Button size='icon-sm' aria-label='More'>
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  );
}
