import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select';

const SOURCES: ReadonlyArray<SelectOption> = [
  { value: 'search', label: 'Search engine' },
  { value: 'referral', label: 'A colleague' },
  { value: 'event', label: 'An event' },
];

/** An option's value or the typed text; “Other…” emits '' and folds open the text field. */
export function OptionSelectAllowCustom() {
  const [value, setValue] = useState<string | null>('A podcast');
  return (
    <Field className='w-64'>
      <FieldLabel htmlFor='source'>How did you hear about us?</FieldLabel>
      <OptionSelect
        allowCustom
        id='source'
        items={SOURCES}
        value={value}
        onValueChange={setValue}
        placeholder='Choose a source'
        otherLabel='Other source'
        otherPlaceholder='Tell us where'
      />
    </Field>
  );
}
