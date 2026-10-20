import { useState } from 'react';

import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select';

const PROJECTS: ReadonlyArray<SelectOption> = [
  'Atlas',
  'Beacon',
  'Comet',
  'Delta',
  'Harbor',
  'Orbit',
  'Pioneer',
  'Summit',
].map((name) => ({ value: name.toLowerCase(), label: name }));

/** Type to filter, Enter picks the first match; one value with a clear button. Always virtualized. */
export function SearchSelectDefault() {
  const [value, setValue] = useState<string | null>('beacon');
  return (
    <SearchSelect
      aria-label='Project'
      items={PROJECTS}
      value={value}
      onValueChange={setValue}
      placeholder='Choose a project'
      className='w-64'
    />
  );
}
