import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '~/components/ui/combobox';

interface Town {
  readonly value: string;
  readonly label: string;
}

interface Region {
  readonly value: string;
  readonly items: ReadonlyArray<Town>;
}

const REGIONS: ReadonlyArray<Region> = [
  {
    value: 'Nord',
    items: [
      { value: 'bremen', label: 'Bremen' },
      { value: 'hamburg', label: 'Hamburg' },
    ],
  },
  {
    value: 'Süd',
    items: [
      { value: 'muenchen', label: 'München' },
      { value: 'stuttgart', label: 'Stuttgart' },
    ],
  },
];

/** `items` as groups; each `ComboboxGroup` renders its own `ComboboxCollection`. */
export function ComboboxGrouped() {
  return (
    <Combobox items={REGIONS} itemToStringLabel={(town: Town) => town.label}>
      <ComboboxInput placeholder='Ort suchen' aria-label='Ort' className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>Kein Ort gefunden</ComboboxEmpty>
        <ComboboxList>
          {(region: Region) => (
            <ComboboxGroup key={region.value} items={region.items}>
              <ComboboxLabel>{region.value}</ComboboxLabel>
              <ComboboxCollection>
                {(town: Town) => (
                  <ComboboxItem key={town.value} value={town}>
                    {town.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
