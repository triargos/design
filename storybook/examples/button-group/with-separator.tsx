import { ChevronDownIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '~/components/ui/button-group';

/** A split button: solid buttons need the separator to read as two. */
export function ButtonGroupWithSeparator() {
  return (
    <ButtonGroup>
      <Button type='button' size='sm'>
        Veröffentlichen
      </Button>
      <ButtonGroupSeparator />
      <Button type='button' size='icon-sm' aria-label='Weitere Optionen'>
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  );
}
