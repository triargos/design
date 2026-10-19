import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox';

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

/** A field that filters a list as you type; the list is a popup. */
export function ComboboxDefault() {
  return (
    <Combobox items={TOWNS} defaultValue={TOWNS[2]} itemToStringLabel={(town: Town) => town.label}>
      <ComboboxInput placeholder='Ort suchen' aria-label='Ort' showClear className='w-64' />
      <ComboboxContent>
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
