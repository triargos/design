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
import type { SelectOption } from '~/components/ui/select';

const TAGS: ReadonlyArray<SelectOption> = ['Bug', 'Feature', 'Design', 'Docs', 'Performance'].map((tag) => ({
  value: tag.toLowerCase(),
  label: tag,
}));

/** `multiple allowCustom`: options and typed tags as chips. A typed tag's value and label are its text. */
export function ComboboxMultipleAllowCustom() {
  const [tags, setTags] = useState<string[]>(['bug', 'Onboarding']);
  return (
    <Combobox multiple allowCustom items={TAGS} value={tags} onValueChange={setTags}>
      <ComboboxChips className='w-80'>
        <ComboboxValue>
          {(selected: SelectOption[]) =>
            selected.map((item) => <ComboboxChip key={item.value}>{item.label}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label='Tags' placeholder={tags.length === 0 ? 'Choose or type tags' : undefined} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No tags found</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
