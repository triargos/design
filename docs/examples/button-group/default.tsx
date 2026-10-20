import { IconChevronDown } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

/** Buttons that act on one thing; inner corners go square. */
export function ButtonGroupDefault() {
  return (
    <ButtonGroup>
      <Button>Preview</Button>
      <Button>Download</Button>
      <Button size='icon' aria-label='More'>
        <IconChevronDown />
      </Button>
    </ButtonGroup>
  );
}
