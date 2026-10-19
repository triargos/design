import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
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

/** Chips in the field: 32px, 4px in, rounded-inner. */
export function ComboboxMultiple() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox multiple items={TOWNS} defaultValue={TOWNS.slice(0, 2)} itemToStringLabel={(town: Town) => town.label}>
      <ComboboxChips ref={anchor} className='w-80'>
        <ComboboxValue>
          {(value: Town[]) => value.map((town) => <ComboboxChip key={town.value}>{town.label}</ComboboxChip>)}
        </ComboboxValue>
        <ComboboxChipsInput placeholder='Weitere Orte' aria-label='Orte' />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
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
