import { IconArchive } from '@tabler/icons-react';
import { useState } from 'react';

import { Toggle } from '~/components/ui/toggle';

/** A filter that stays on: `pressed` + `onPressedChange`. */
export function ToggleDefault() {
  const [archived, setArchived] = useState(false);
  return (
    <Toggle pressed={archived} onPressedChange={setArchived}>
      <IconArchive data-icon='inline-start' />
      Archived
    </Toggle>
  );
}
