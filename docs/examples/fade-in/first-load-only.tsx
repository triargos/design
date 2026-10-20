import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { FadeIn, useShouldFadeIn } from '~/components/ui/fade-in';
import { Skeleton } from '~/components/ui/skeleton';

const MEMBERS = ['Jordan Lee', 'Sam Rivera', 'Priya Nair', 'Lena Park'];

// Stands in for a query with a cache: the first mount loads, later mounts read the cache.
let cached = false;
function useMembers() {
  const [pending, setPending] = useState(!cached);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      cached = true;
      setPending(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pending]);
  return { pending, members: pending ? [] : MEMBERS };
}

function Members() {
  const { pending, members } = useMembers();
  const shouldFadeIn = useShouldFadeIn(pending);

  if (pending) {
    return (
      <div className='flex flex-col gap-2'>
        {MEMBERS.map((name) => (
          <Skeleton key={name} className='h-3.5 w-32' />
        ))}
      </div>
    );
  }
  return (
    <FadeIn animate={shouldFadeIn} render={<ul />} className='flex flex-col gap-0.5 text-body'>
      {members.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </FadeIn>
  );
}

/** `useShouldFadeIn`: the members fade in after the first load; opened again, they come from the cache and show at once. */
export function FadeInFirstLoadOnly() {
  const [open, setOpen] = useState(false);
  return (
    <div className='flex w-64 flex-col gap-group'>
      <Button className='self-start' onClick={() => setOpen((value) => !value)}>
        {open ? 'Hide members' : 'Show members'}
      </Button>
      <div className='min-h-28'>{open && <Members />}</div>
    </div>
  );
}
