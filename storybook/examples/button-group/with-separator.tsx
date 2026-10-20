import { ChevronDownIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '~/components/ui/button-group';

/** A split button: solid buttons need the separator to read as two. */
export function ButtonGroupWithSeparator() {
  return (
    <ButtonGroup>
      <Button intent='primary' size='sm'>
        Publish
      </Button>
      <ButtonGroupSeparator />
      <Button intent='primary' size='icon-sm' aria-label='More publish options'>
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  );
}
