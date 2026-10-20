import { ChevronDownIcon, MoreHorizontalIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

/** `aria-expanded` keeps the pressed look while the menu it opens is open. */
export function ButtonOpen() {
  return (
    <div className='flex items-center gap-2'>
      <Button aria-expanded aria-haspopup='menu'>
        Options
        <ChevronDownIcon data-icon='inline-end' />
      </Button>
      <Button emphasis='ghost' size='icon' aria-expanded aria-haspopup='menu' aria-label='More'>
        <MoreHorizontalIcon />
      </Button>
    </div>
  );
}
