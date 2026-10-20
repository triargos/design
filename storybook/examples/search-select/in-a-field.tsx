import { useState } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
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

/** `Field`, label and error around it; in a form, `Controller` renders the `Field`. */
export function SearchSelectInAField() {
  const [value, setValue] = useState<string[]>([]);
  const invalid = value.length === 0;
  return (
    <Field invalid={invalid} className='w-80'>
      <FieldLabel htmlFor='field-reviewers'>Reviewers</FieldLabel>
      <SearchSelect
        multiple
        id='field-reviewers'
        items={MEMBERS}
        value={value}
        onValueChange={setValue}
        aria-invalid={invalid}
        placeholder='Add reviewers'
      />
      {invalid && <FieldError>Add at least one reviewer.</FieldError>}
    </Field>
  );
}
