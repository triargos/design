import { useState } from 'react';

import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select-option';

const TEACHERS: ReadonlyArray<SelectOption> = [
  { value: 'mueller', label: 'Petra Müller', description: 'Deutsch, Sport' },
  { value: 'schmidt', label: 'Jan Schmidt', description: 'Mathematik' },
  { value: 'yilmaz', label: 'Elif Yılmaz', description: 'Englisch, Kunst' },
];

/** A `description` field on the item shows muted beside the label; `renderItem` for anything else. */
export function SearchSelectWithDescription() {
  const [value, setValue] = useState<string | null>('schmidt');
  return (
    <SearchSelect
      items={TEACHERS}
      itemKey={(option) => option.value}
      itemLabel={(option) => option.label}
      value={value}
      onValueChange={setValue}
      placeholder='Lehrkraft wählen'
      className='w-72'
    />
  );
}
