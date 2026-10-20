import { useState } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { OptionSelect } from '~/components/ui/option-select';
import type { SelectOption } from '~/components/ui/select';

const SOURCES: ReadonlyArray<SelectOption> = [
  { value: 'search', label: 'Search engine' },
  { value: 'referral', label: 'A colleague' },
  { value: 'event', label: 'An event' },
];

/** Required: “Other” with no text is '', so a non-empty check covers it; the error marks the text field. */
export function OptionSelectInAField() {
  const [value, setValue] = useState<string | null>('');
  const invalid = !value?.trim();
  return (
    <Field invalid={invalid} className='w-64'>
      <FieldLabel htmlFor='field-source'>How did you hear about us?</FieldLabel>
      <OptionSelect
        allowCustom
        id='field-source'
        items={SOURCES}
        value={value}
        onValueChange={setValue}
        aria-invalid={invalid}
        placeholder='Choose a source'
        otherLabel='Other source'
        otherPlaceholder='Tell us where'
      />
      {invalid && <FieldError>Tell us how you heard about us.</FieldError>}
    </Field>
  );
}
