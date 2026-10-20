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

/** Type to filter, Enter picks the first match; with a value, a clear button takes the place of the ⇅ button. */
export function ComboboxDefault() {
  const [project, setProject] = useState<string | null>('beacon');
  return (
    <Combobox items={PROJECTS} value={project} onValueChange={setProject}>
      <ComboboxInput aria-label='Project' placeholder='Choose a project' className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>No projects found</ComboboxEmpty>
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
