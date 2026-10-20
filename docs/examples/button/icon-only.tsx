import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

/** `aria-label` names the action; the icon sizes match the text sizes, so a row of both lines up. */
export function ButtonIconOnly() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button size='icon-xs' aria-label='More'>
        <MoreHorizontalIcon />
      </Button>
      <Button size='icon-sm' aria-label='More'>
        <MoreHorizontalIcon />
      </Button>
      <Button size='icon' aria-label='More'>
        <MoreHorizontalIcon />
      </Button>
      <Button size='icon-lg' aria-label='More'>
        <MoreHorizontalIcon />
      </Button>
    </div>
  );
}
