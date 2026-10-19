import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select-option';

const STATUSES: ReadonlyArray<SelectOption> = [
  { value: 'open', label: 'Offen' },
  { value: 'review', label: 'In Prüfung' },
  { value: 'done', label: 'Erledigt' },
];

/** Items, a key and a label: SearchSelect's API for a short list. */
export function OptionSelectDefault() {
  const [value, setValue] = useState<string | null>('review');
  return (
    <Field className='w-56'>
      <FieldLabel htmlFor='status'>Status</FieldLabel>
      <OptionSelect
        id='status'
        items={STATUSES}
        itemKey={(option) => option.value}
        itemLabel={(option) => option.label}
        value={value}
        onValueChange={setValue}
      />
    </Field>
  );
}
