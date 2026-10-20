import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react';

import { Toggle } from '~/components/ui/toggle';

/** Icon-only marks in a muted toolbar: each takes an `aria-label`; at rest they take the toolbar's text color. */
export function ToggleToolbar() {
  return (
    <div className='flex items-center gap-0.5 text-muted-foreground'>
      <Toggle size='icon-xs' aria-label='Bold' defaultPressed>
        <IconBold />
      </Toggle>
      <Toggle size='icon-xs' aria-label='Italic'>
        <IconItalic />
      </Toggle>
      <Toggle size='icon-xs' aria-label='Underline'>
        <IconUnderline />
      </Toggle>
    </div>
  );
}
