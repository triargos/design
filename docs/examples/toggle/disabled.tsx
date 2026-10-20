import { IconArchive } from '@tabler/icons-react';

import { Toggle } from '~/components/ui/toggle';

export function ToggleDisabled() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Toggle disabled>
        <IconArchive data-icon='inline-start' />
        Archived
      </Toggle>
      <Toggle disabled defaultPressed>
        <IconArchive data-icon='inline-start' />
        Archived
      </Toggle>
    </div>
  );
}
