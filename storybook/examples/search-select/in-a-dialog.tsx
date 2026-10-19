import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Field, FieldLabel } from '~/components/ui/field';
import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select-option';

const CLASSES: ReadonlyArray<SelectOption> = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'].map((name) => ({
  value: name,
  label: `Klasse ${name}`,
}));

/** In a dialog the popup portals above it and keeps focus in it. */
export function SearchSelectInADialog() {
  const [value, setValue] = useState<string[]>(['1a']);
  return (
    <Dialog>
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Klassen zuordnen</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Klassen zuordnen</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel htmlFor='dialog-classes'>Klassen</FieldLabel>
            <SearchSelect
              multiple
              id='dialog-classes'
              items={CLASSES}
              itemKey={(option) => option.value}
              itemLabel={(option) => option.label}
              value={value}
              onValueChange={setValue}
              placeholder='Klassen wählen'
            />
          </Field>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
