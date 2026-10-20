import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
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

/** An option's value or the typed text. The custom row emits `''` and folds open the text field, which takes focus. */
export function SelectAllowCustom() {
  const [source, setSource] = useState<string | null>('A podcast');
  return (
    <Field className='w-64'>
      <FieldLabel htmlFor='source'>How did you hear about us?</FieldLabel>
      <Select allowCustom customLabel='Other source' items={SOURCES} value={source} onValueChange={setSource}>
        {/* One element: the gap to the text field folds with it. */}
        <div>
          <SelectTrigger id='source'>
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
    </Field>
  );
}
