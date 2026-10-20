import { useState } from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '~/components/ui/combobox';
import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import type { SelectOption } from '~/components/ui/select';

const MEMBERS: ReadonlyArray<SelectOption> = [
  'Maya Chen',
  'Jonas Weber',
  'Priya Patel',
  'Leo Martin',
  'Sofia Rossi',
  'Noah Kim',
].map((name) => ({ value: name.toLowerCase().replace(' ', '-'), label: name }));

/** `Field`, label and error around it; in a form, `Controller` renders the `Field`. */
export function ComboboxInAField() {
  const [reviewers, setReviewers] = useState<string[]>([]);
  const invalid = reviewers.length === 0;
  return (
    <Field invalid={invalid} className='w-80'>
      <FieldLabel htmlFor='field-reviewers'>Reviewers</FieldLabel>
      <Combobox multiple items={MEMBERS} value={reviewers} onValueChange={setReviewers}>
        <ComboboxChips aria-invalid={invalid}>
          <ComboboxValue>
            {(selected: SelectOption[]) =>
              selected.map((item) => <ComboboxChip key={item.value}>{item.label}</ComboboxChip>)
            }
          </ComboboxValue>
          <ComboboxChipsInput id='field-reviewers' placeholder={invalid ? 'Add reviewers' : undefined} />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No members found</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {invalid && <FieldError>Add at least one reviewer.</FieldError>}
    </Field>
  );
}
