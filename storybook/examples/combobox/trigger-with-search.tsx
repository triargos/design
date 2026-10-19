import { ChevronsUpDownIcon, SearchIcon } from 'lucide-react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '~/components/ui/combobox';
import { selectTriggerVariants } from '~/components/ui/select';

interface Town {
  readonly value: string;
  readonly label: string;
}

const TOWNS: ReadonlyArray<Town> = [
  { value: 'berlin', label: 'Berlin' },
  { value: 'bremen', label: 'Bremen' },
  { value: 'hamburg', label: 'Hamburg' },
  { value: 'koeln', label: 'Köln' },
  { value: 'muenchen', label: 'München' },
];

/** After coss ui: a select-like trigger; the search field sits in the popup. */
export function ComboboxTriggerWithSearch() {
  return (
    <Combobox items={TOWNS} defaultValue={TOWNS[0]} itemToStringLabel={(town: Town) => town.label}>
      <ComboboxTrigger
        render={<button type='button' aria-label='Ort' className={selectTriggerVariants({ className: 'w-64' })} />}>
        <ComboboxValue />
        <ChevronsUpDownIcon />
      </ComboboxTrigger>
      <ComboboxContent aria-label='Ort wählen'>
        <ComboboxInput placeholder='Ort suchen' showTrigger={false} startAddon={<SearchIcon />} />
        <ComboboxEmpty>Kein Ort gefunden</ComboboxEmpty>
        <ComboboxList>
          {(town: Town) => (
            <ComboboxItem key={town.value} value={town}>
              {town.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
