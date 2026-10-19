import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { SearchSelect } from '~/components/ui/search-select';

const TOWNS = ['Berlin', 'Bremen', 'Hamburg', 'Köln', 'München'].map((name) => ({ value: name, label: name }));

/** `allowCustom`: a key from the list or the typed text; a custom value reads „Eigene Angabe“ in its list row. */
export function SearchSelectCustomValue() {
  const [value, setValue] = useState<string | null>('Oldenburg');
  return (
    <Field className='w-64'>
      <FieldLabel htmlFor='town'>Ort</FieldLabel>
      <SearchSelect
        allowCustom
        id='town'
        items={TOWNS}
        itemKey={(option) => option.value}
        itemLabel={(option) => option.label}
        value={value}
        onValueChange={setValue}
        placeholder='Ort suchen oder eingeben'
      />
    </Field>
  );
}
