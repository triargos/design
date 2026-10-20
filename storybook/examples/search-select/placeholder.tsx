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

export function SearchSelectPlaceholder() {
  const [value, setValue] = useState<string | null>(null);
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
