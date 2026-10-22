import { IconStar } from '@tabler/icons-react';

import { Toggle } from '~/components/ui/toggle';

/** As `Button`: `sm` 32 · default 36 · `lg` 40, and the `icon-*` squares. */
export function ToggleSizes() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Toggle size='sm' defaultPressed>
        Starred
      </Toggle>
      <Toggle defaultPressed>Starred</Toggle>
      <Toggle size='lg' defaultPressed>
        Starred
      </Toggle>
      <Toggle size='icon-sm' aria-label='Starred' defaultPressed>
        <IconStar />
      </Toggle>
      <Toggle size='icon' aria-label='Starred' defaultPressed>
        <IconStar />
      </Toggle>
      <Toggle size='icon-lg' aria-label='Starred' defaultPressed>
        <IconStar />
      </Toggle>
    </div>
  );
}
