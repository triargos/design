import { ChevronDownIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';

/** Buttons that act on one thing; inner corners go square. */
export function ButtonGroupDefault() {
  return (
    <ButtonGroup>
      <Button type='button' intent='neutral' emphasis='raised' size='sm'>
        Vorschau
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='sm'>
        Herunterladen
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='icon-sm' aria-label='Mehr'>
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  );
}
