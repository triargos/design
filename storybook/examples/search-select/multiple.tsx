import { useState } from 'react';

import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select-option';

const CLASSES: ReadonlyArray<SelectOption> = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'].map((name) => ({
  value: name,
  label: `Klasse ${name}`,
}));

/** `multiple`: chips in the field. */
export function SearchSelectMultiple() {
  const [value, setValue] = useState<string[]>(['1a', '2b', '3a']);
  return (
    <SearchSelect
      multiple
      items={CLASSES}
      itemKey={(option) => option.value}
      itemLabel={(option) => option.label}
      value={value}
      onValueChange={setValue}
      placeholder='Klassen wählen'
      className='w-80'
    />
  );
}
