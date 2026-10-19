import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardFooter,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { UnsavedChangesIndicator } from '~/components/ui/unsaved-changes-indicator';

/** `InsetCardFooter show` while the form is dirty; type to show it again. */
export function InsetCardWithFooter() {
  const [dirty, setDirty] = useState(true);
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Profil</InsetCardTitle>
        <InsetCardDescription>So sehen dich andere Eltern und die Schule.</InsetCardDescription>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <Field>
          <FieldLabel htmlFor='card-name'>Name</FieldLabel>
          <Input id='card-name' defaultValue='Erika Mustermann' onChange={() => setDirty(true)} />
        </Field>
      </InsetCardContent>
      <InsetCardFooter show={dirty} className='flex items-center justify-end gap-3'>
        <UnsavedChangesIndicator show={dirty} animated={false} />
        <Button type='button' size='sm' onClick={() => setDirty(false)}>
          Speichern
        </Button>
      </InsetCardFooter>
    </InsetCard>
  );
}
