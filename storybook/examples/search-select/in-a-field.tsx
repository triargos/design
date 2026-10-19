import { useState } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select-option';

const CLASSES: ReadonlyArray<SelectOption> = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'].map((name) => ({
  value: name,
  label: `Klasse ${name}`,
}));

/** Not bound to a form: `Field` + label + error around it, through `Controller` in the app. */
export function SearchSelectInAField() {
  const [value, setValue] = useState<string[]>([]);
  const invalid = value.length === 0;
  return (
    <Field data-invalid={invalid || undefined} className='w-80'>
      <FieldLabel htmlFor='field-classes'>Klassen</FieldLabel>
      <SearchSelect
        multiple
        id='field-classes'
        items={CLASSES}
        itemKey={(option) => option.value}
        itemLabel={(option) => option.label}
        value={value}
        onValueChange={setValue}
        invalid={invalid}
        placeholder='Klassen wählen'
      />
      {invalid && <FieldError>Bitte wähle mindestens eine Klasse.</FieldError>}
    </Field>
  );
}
