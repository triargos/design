import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Field, FieldLabel } from '~/components/ui/field';
import type { SelectOption } from '~/components/ui/select';

const MEMBERS: ReadonlyArray<SelectOption> = [
  'Maya Chen',
  'Jonas Weber',
  'Priya Patel',
  'Leo Martin',
  'Sofia Rossi',
  'Noah Kim',
].map((name) => ({ value: name.toLowerCase().replace(' ', '-'), label: name }));

/** In a dialog the popup portals above it and keeps focus in it. */
export function ComboboxInADialog() {
  const [owner, setOwner] = useState<string | null>('maya-chen');
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Change owner</DialogTrigger>
      <DialogContent size='sm'>
        <DialogHeader>
          <DialogTitle>Change owner</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel htmlFor='dialog-owner'>Owner</FieldLabel>
            <Combobox items={MEMBERS} value={owner} onValueChange={setOwner}>
              <ComboboxInput id='dialog-owner' placeholder='Choose an owner' />
              <ComboboxContent>
                <ComboboxEmpty>No members found</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
