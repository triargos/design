import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { UnsavedChangesIndicator } from '~/components/ui/unsaved-changes-indicator';

/** Slides in next to the save action while there are changes. */
export function UnsavedChangesIndicatorDefault() {
  const [dirty, setDirty] = useState(true);
  return (
    <div className='flex items-center gap-3'>
      <UnsavedChangesIndicator show={dirty} />
      <Button type='button' intent='neutral' emphasis='raised' size='sm' onClick={() => setDirty(!dirty)}>
        {dirty ? 'Speichern' : 'Ändern'}
      </Button>
    </div>
  );
}
