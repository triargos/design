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
} from '~/components/ui/combobox';

interface Label {
  readonly value: string;
  readonly label: string;
}

const LABELS: ReadonlyArray<Label> = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'design', label: 'Design' },
  { value: 'docs', label: 'Docs' },
  { value: 'research', label: 'Research' },
];

/** Chips in the field: 32px, 4px in, rounded-inner. The popup anchors to the chips field. */
export function ComboboxMultiple() {
  return (
    <Combobox
      multiple
      items={LABELS}
      defaultValue={LABELS.slice(0, 2)}
      itemToStringLabel={(label: Label) => label.label}>
      <ComboboxChips className='w-80'>
        <ComboboxValue>
          {(value: Label[]) => value.map((label) => <ComboboxChip key={label.value}>{label.label}</ComboboxChip>)}
        </ComboboxValue>
        <ComboboxChipsInput placeholder='Add labels' aria-label='Labels' />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No labels found</ComboboxEmpty>
        <ComboboxList>
          {(label: Label) => (
            <ComboboxItem key={label.value} value={label}>
              {label.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
