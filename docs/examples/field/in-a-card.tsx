import { AtSignIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardFooter,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { Textarea } from '~/components/ui/textarea';
import { UnsavedChangesIndicator } from '~/components/ui/unsaved-changes-indicator';

/** A form is fields in a card; the footer shows while there are changes. */
export function FieldInACard() {
  const [dirty, setDirty] = useState(true);
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Profile</InsetCardTitle>
        <InsetCardDescription>What other members of the workspace see.</InsetCardDescription>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <FieldGroup>
          <FieldGroup columns={2}>
            <Field>
              <FieldLabel htmlFor='profile-first'>First name</FieldLabel>
              <Input id='profile-first' defaultValue='Maya' onChange={() => setDirty(true)} />
            </Field>
            <Field>
              <FieldLabel htmlFor='profile-last'>Last name</FieldLabel>
              <Input id='profile-last' defaultValue='Chen' onChange={() => setDirty(true)} />
            </Field>
          </FieldGroup>
          <Field>
            <FieldLabel htmlFor='profile-email'>Email</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <AtSignIcon />
              </InputGroupAddon>
              <InputGroupInput
                id='profile-email'
                type='email'
                defaultValue='maya@example.com'
                onChange={() => setDirty(true)}
              />
            </InputGroup>
            <FieldDescription>Task updates and invoices go to this address.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor='profile-bio'>Bio</FieldLabel>
            <Textarea id='profile-bio' placeholder='Optional' rows={3} onChange={() => setDirty(true)} />
          </Field>
        </FieldGroup>
      </InsetCardContent>
      <InsetCardFooter show={dirty} className='flex items-center justify-end gap-3'>
        <UnsavedChangesIndicator show={dirty} animated={false} />
        <Button intent='primary' size='sm' onClick={() => setDirty(false)}>
          Save
        </Button>
      </InsetCardFooter>
    </InsetCard>
  );
}
