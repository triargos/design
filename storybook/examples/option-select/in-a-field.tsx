import { useState } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select-option';

const RELATIONS: ReadonlyArray<SelectOption> = [
  { value: 'mother', label: 'Mutter' },
  { value: 'father', label: 'Vater' },
  { value: 'grandparent', label: 'Großelternteil' },
];

/** Required: „Andere" with no text is '', so a non-empty check covers it; the error marks the text field. */
export function OptionSelectInAField() {
  const [value, setValue] = useState<string | null>('');
  const invalid = !value?.trim();
  return (
    <Field data-invalid={invalid || undefined} className='w-64'>
      <FieldLabel htmlFor='field-relation'>Beziehung zum Kind</FieldLabel>
      <OptionSelect
        allowCustom
        id='field-relation'
        items={RELATIONS}
        itemKey={(option) => option.value}
        itemLabel={(option) => option.label}
        value={value}
        onValueChange={setValue}
        invalid={invalid}
        placeholder='Beziehung wählen'
        otherLabel='Andere Beziehung'
        otherPlaceholder='Beziehung angeben'
      />
      {invalid && <FieldError>Bitte gib die Beziehung an.</FieldError>}
    </Field>
  );
}
