import { ChevronDownIcon, MoreHorizontalIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

/** `aria-expanded` keeps the pressed look while the menu it opens is open. */
export function ButtonOpen() {
  return (
    <div className='flex items-center gap-2'>
      <Button type='button' intent='neutral' emphasis='raised' aria-expanded aria-haspopup='menu'>
        Optionen
        <ChevronDownIcon data-icon='inline-end' />
      </Button>
      <Button
        type='button'
        intent='neutral'
        emphasis='ghost'
        size='icon'
        aria-expanded
        aria-haspopup='menu'
        aria-label='Mehr'>
        <MoreHorizontalIcon />
      </Button>
    </div>
  );
}
