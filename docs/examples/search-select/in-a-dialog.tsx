import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Field, FieldLabel } from '~/components/ui/field';
import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select';

const MEMBERS: ReadonlyArray<SelectOption> = [
  'Maya Chen',
  'Jonas Weber',
  'Priya Patel',
  'Leo Martin',
  'Sofia Rossi',
  'Noah Kim',
  'Emma Larsen',
  'Omar Haddad',
].map((name) => ({ value: name.toLowerCase().replace(' ', '-'), label: name }));

/** In a dialog the popup portals above it and keeps focus in it. */
export function SearchSelectInADialog() {
  const [value, setValue] = useState<string[]>(['maya-chen']);
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Add members</DialogTrigger>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel htmlFor='dialog-members'>Members</FieldLabel>
            <SearchSelect
              multiple
              id='dialog-members'
              items={MEMBERS}
              value={value}
              onValueChange={setValue}
              placeholder='Add members'
            />
          </Field>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
