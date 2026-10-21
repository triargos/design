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

const PAGES: ReadonlyArray<SelectOption> = [
  'Mobile app',
  'Design system',
  'Mapping',
  'Design',
  'App Store listing',
  'Designer handoff',
].map((name) => ({ value: name.toLowerCase().replaceAll(' ', '-'), label: name }));

/** Exact, prefix, word start, then contains; the order of `items` within each. The items lead with the weaker matches. */
export function ComboboxMatching() {
  const [page, setPage] = useState<string | null>(null);
  return (
    <Combobox items={PAGES} value={page} onValueChange={setPage}>
      <ComboboxInput aria-label='Page' placeholder='Try “app” or “design”' className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>No pages found</ComboboxEmpty>
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
