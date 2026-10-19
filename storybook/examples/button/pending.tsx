import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

/** `isLoading`: the label keeps the width; the spinner shows at least 800ms, so a fast request never flashes. */
export function ButtonPending() {
  const [pending, setPending] = useState(false);
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' isLoading>
        Speichern
      </Button>
      <Button type='button' intent='destructive' emphasis='solid' size='icon' isLoading aria-label='Löschen'>
        <Trash2Icon />
      </Button>
      <Button
        type='button'
        intent='neutral'
        emphasis='raised'
        isLoading={pending}
        onClick={() => {
          setPending(true);
          setTimeout(() => setPending(false), 150);
        }}>
        Schnelle Anfrage
      </Button>
    </div>
  );
}
