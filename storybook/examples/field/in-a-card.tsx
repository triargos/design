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
        <InsetCardTitle>Profil</InsetCardTitle>
        <InsetCardDescription>So sehen dich andere Eltern und die Schule.</InsetCardDescription>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <FieldGroup>
          <FieldGroup columns={2}>
            <Field>
              <FieldLabel htmlFor='profile-first'>Vorname</FieldLabel>
              <Input id='profile-first' defaultValue='Erika' onChange={() => setDirty(true)} />
            </Field>
            <Field>
              <FieldLabel htmlFor='profile-last'>Nachname</FieldLabel>
              <Input id='profile-last' defaultValue='Mustermann' onChange={() => setDirty(true)} />
            </Field>
          </FieldGroup>
          <Field>
            <FieldLabel htmlFor='profile-email'>E-Mail</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <AtSignIcon />
              </InputGroupAddon>
              <InputGroupInput
                id='profile-email'
                type='email'
                defaultValue='erika@schule.de'
                onChange={() => setDirty(true)}
              />
            </InputGroup>
            <FieldDescription>An diese Adresse schicken wir Nachrichten der Schule.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor='profile-note'>Notiz für die Klassenleitung</FieldLabel>
            <Textarea id='profile-note' placeholder='Optional' rows={3} onChange={() => setDirty(true)} />
          </Field>
        </FieldGroup>
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
