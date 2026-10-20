import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

/** `isLoading`: the label keeps the width; the spinner shows at least 800ms, so a fast request never flashes. */
export function ButtonPending() {
  const [pending, setPending] = useState(false);
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button intent='primary' isLoading>
        Save
      </Button>
      <Button intent='destructive' size='icon' isLoading aria-label='Delete'>
        <Trash2Icon />
      </Button>
      <Button
        isLoading={pending}
        onClick={() => {
          setPending(true);
          setTimeout(() => setPending(false), 150);
        }}>
        Fast request
      </Button>
    </div>
  );
}
