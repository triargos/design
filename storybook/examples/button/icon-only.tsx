import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

/** `aria-label` names the action; the icon sizes match the text sizes, so a row of both lines up. */
export function ButtonIconOnly() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' intent='neutral' emphasis='raised' size='icon-xs' aria-label='Mehr'>
        <MoreHorizontalIcon />
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='icon-sm' aria-label='Mehr'>
        <MoreHorizontalIcon />
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='icon' aria-label='Mehr'>
        <MoreHorizontalIcon />
      </Button>
      <Button type='button' intent='neutral' emphasis='raised' size='icon-lg' aria-label='Mehr'>
        <MoreHorizontalIcon />
      </Button>
    </div>
  );
}
