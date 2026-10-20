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

const MEMBERS: ReadonlyArray<SelectOption> = [
  'Maya Chen',
  'Jonas Weber',
  'Priya Patel',
  'Leo Martin',
  'Sofia Rossi',
  'Noah Kim',
  'Emma Larsen',
  'Omar Haddad',
].map((name) => ({ value: name.toLowerCase().replace(' ', '-'), label: name }));

/** `multiple`: chips in the field; the popup anchors to them. */
export function ComboboxMultiple() {
  const [members, setMembers] = useState<string[]>(['maya-chen', 'priya-patel', 'noah-kim']);
  return (
    <Combobox multiple items={MEMBERS} value={members} onValueChange={setMembers}>
      <ComboboxChips className='w-80'>
        <ComboboxValue>
          {(selected: SelectOption[]) =>
            selected.map((item) => <ComboboxChip key={item.value}>{item.label}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label='Members' placeholder={members.length === 0 ? 'Add members' : undefined} />
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
  );
}
