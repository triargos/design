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

/** Invalid and disabled. With no match the list shows `ComboboxEmpty`. */
export function ComboboxStates() {
  return (
    <div className='grid w-64 gap-2'>
      <Combobox items={TOWNS} itemToStringLabel={(town: Town) => town.label}>
        <ComboboxInput placeholder='Ort suchen' aria-label='Ort, ungültig' aria-invalid />
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
      <Combobox items={TOWNS} defaultValue={TOWNS[0]} disabled itemToStringLabel={(town: Town) => town.label}>
        <ComboboxInput placeholder='Ort suchen' aria-label='Ort, deaktiviert' />
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
    </div>
  );
}
