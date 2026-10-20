import { useState } from 'react';

import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select';

const MEMBERS: ReadonlyArray<SelectOption> = [
  { value: 'maya-chen', label: 'Maya Chen', description: 'Design' },
  { value: 'jonas-weber', label: 'Jonas Weber', description: 'Engineering' },
  { value: 'priya-patel', label: 'Priya Patel', description: 'Finance' },
];

/** An option's `description` shows muted beside its label. */
export function SearchSelectWithDescription() {
  const [value, setValue] = useState<string | null>('jonas-weber');
  return (
    <SearchSelect
      aria-label='Owner'
      items={MEMBERS}
      value={value}
      onValueChange={setValue}
      placeholder='Choose an owner'
      className='w-72'
    />
  );
}
