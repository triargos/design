import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select';

const STATUSES: ReadonlyArray<SelectOption> = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/** A short list of options; the value is the option's `value`. */
export function OptionSelectDefault() {
  const [value, setValue] = useState<string | null>('in-progress');
  return (
    <Field className='w-56'>
      <FieldLabel htmlFor='status'>Status</FieldLabel>
      <OptionSelect id='status' items={STATUSES} value={value} onValueChange={setValue} />
    </Field>
  );
}
