import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select-option';

const RELATIONS: ReadonlyArray<SelectOption> = [
  { value: 'mother', label: 'Mutter' },
  { value: 'father', label: 'Vater' },
  { value: 'grandparent', label: 'Großelternteil' },
];

/** A key from the list or the typed text; „Andere angeben …" emits '' and folds open the text field. */
export function OptionSelectAllowCustom() {
  const [value, setValue] = useState<string | null>('Tante');
  return (
    <Field className='w-64'>
      <FieldLabel htmlFor='relation'>Beziehung zum Kind</FieldLabel>
      <OptionSelect
        allowCustom
        id='relation'
        items={RELATIONS}
        itemKey={(option) => option.value}
        itemLabel={(option) => option.label}
        value={value}
        onValueChange={setValue}
        placeholder='Beziehung wählen'
        otherLabel='Andere Beziehung'
        otherPlaceholder='Beziehung angeben'
      />
    </Field>
  );
}
