import { useState } from 'react';

import { SearchSelect } from '~/components/ui/search-select';
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

/** `multiple`: chips in the field. */
export function SearchSelectMultiple() {
  const [value, setValue] = useState<string[]>(['maya-chen', 'priya-patel', 'noah-kim']);
  return (
    <SearchSelect
      multiple
      aria-label='Members'
      items={MEMBERS}
      value={value}
      onValueChange={setValue}
      placeholder='Add members'
      className='w-80'
    />
  );
}
