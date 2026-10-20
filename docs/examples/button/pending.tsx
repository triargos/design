import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

/**
 * `isLoading`: the label keeps the width; the spinner shows at least 800ms, so a fast request never flashes. A pending
 * button keeps focus and takes no second click: double-click the last one, it sends one request.
 */
export function ButtonPending() {
  const [pending, setPending] = useState(false);
  const [requests, setRequests] = useState(0);
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
          setRequests((count) => count + 1);
          setPending(true);
          setTimeout(() => setPending(false), 150);
        }}>
        Fast request
      </Button>
      <span className='text-caption text-muted-foreground tabular-nums'>Requests sent: {requests}</span>
    </div>
  );
}
