import { AtSignIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';

/** A form is fields in a card; the footer shows while there are changes. */
export function FieldInACard() {
  const [dirty, setDirty] = useState(true);
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>What other members of the workspace see.</CardDescription>
      </CardHeader>
      <CardContent className='p-card'>
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
      </CardContent>
      <CardFooter show={dirty} className='flex items-center justify-end gap-related'>
        <span className='text-body text-muted-foreground'>Unsaved changes</span>
        <Button intent='primary' onClick={() => setDirty(false)}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
