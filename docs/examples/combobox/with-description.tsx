import { useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox';
import type { SelectOption } from '~/components/ui/select';

const MEMBERS: ReadonlyArray<SelectOption> = [
  { value: 'maya-chen', label: 'Maya Chen', description: 'Design' },
  { value: 'jonas-weber', label: 'Jonas Weber', description: 'Engineering' },
  { value: 'priya-patel', label: 'Priya Patel', description: 'Finance' },
];

/** A row's content is yours: here the `description` muted beside the label. */
export function ComboboxWithDescription() {
  const [owner, setOwner] = useState<string | null>('jonas-weber');
  return (
    <Combobox items={MEMBERS} value={owner} onValueChange={setOwner}>
      <ComboboxInput aria-label='Owner' placeholder='Choose an owner' className='w-72' />
      <ComboboxContent>
        <ComboboxEmpty>No members found</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              <span className='truncate'>{item.label}</span>
              <span className='truncate text-caption text-muted-foreground'>{item.description}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
