import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  InsetCard,
  InsetCardContent,
  InsetCardFooter,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { UnsavedChangesIndicator } from '~/components/ui/unsaved-changes-indicator';

/** In a card footer, which animates its own reveal: `animated={false}`. */
export function UnsavedChangesIndicatorInACard() {
  const [dirty, setDirty] = useState(true);
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Schule</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <Field>
          <FieldLabel htmlFor='school-name'>Name</FieldLabel>
          <Input id='school-name' defaultValue='Grundschule am See' onChange={() => setDirty(true)} />
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
