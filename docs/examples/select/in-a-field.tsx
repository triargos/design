import { useState } from 'react';

import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import {
  Select,
  SelectContent,
  SelectCustomInput,
  SelectCustomItem,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from '~/components/ui/select';

const SOURCES: ReadonlyArray<SelectOption> = [
  { value: 'search', label: 'Search engine' },
  { value: 'referral', label: 'A colleague' },
  { value: 'event', label: 'An event' },
];

/**
 * Required: the custom row without text is `''`, so a non-empty check covers it. `aria-invalid` on the root marks the
 * trigger, or the text field once the custom row is chosen.
 */
export function SelectInAField() {
  const [source, setSource] = useState<string | null>('');
  const invalid = !source?.trim();
  return (
    <Field invalid={invalid} className='w-64'>
      <FieldLabel htmlFor='field-source'>How did you hear about us?</FieldLabel>
      <Select
        allowCustom
        customLabel='Other source'
        aria-invalid={invalid}
        items={SOURCES}
        value={source}
        onValueChange={setSource}>
        <div>
          <SelectTrigger id='field-source'>
            <SelectValue placeholder='Choose a source' />
          </SelectTrigger>
          <SelectCustomInput placeholder='Tell us where' />
        </div>
        <SelectContent>
          {SOURCES.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectCustomItem />
        </SelectContent>
      </Select>
      {invalid && <FieldError>Tell us how you heard about us.</FieldError>}
    </Field>
  );
}
