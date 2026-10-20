import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { UnsavedChangesIndicator } from '~/components/ui/unsaved-changes-indicator';

/** Slides in next to the save action while there are changes. */
export function UnsavedChangesIndicatorDefault() {
  const [dirty, setDirty] = useState(true);
  return (
    <div className='flex items-center gap-3'>
      <UnsavedChangesIndicator show={dirty} />
      <Button size='sm' onClick={() => setDirty(!dirty)}>
        {dirty ? 'Save' : 'Edit'}
      </Button>
    </div>
  );
}
