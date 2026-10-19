import { useRef, useState } from 'react';

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput } from '~/components/ui/combobox';
import type { SelectOption } from '~/components/ui/select-option';
import {
  useVirtualizedCombobox,
  VirtualizedComboboxList,
  type VirtualizerInstance,
} from '~/components/ui/virtualized-combobox';

const STREETS = ['Hauptstraße', 'Schulweg', 'Gartenstraße', 'Bahnhofstraße', 'Lindenallee', 'Am See', 'Kirchplatz'];

const MANY: ReadonlyArray<SelectOption> = Array.from({ length: 2100 }, (_, index) => ({
  value: String(index),
  label: `${STREETS[index % STREETS.length]} ${Math.floor(index / STREETS.length) + 1}`,
}));

/** `virtualized` + `VirtualizedComboboxList`: only the rows in view render. What Search Select builds. */
export function ComboboxVirtualized() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<SelectOption | null>(MANY[24]);
  const virtualizerRef = useRef<VirtualizerInstance | null>(null);
  const { onItemHighlighted } = useVirtualizedCombobox({ open, virtualizerRef });
  return (
    <Combobox
      virtualized
      items={MANY}
      itemToStringValue={(item: SelectOption) => item.label}
      value={value}
      onValueChange={(item: SelectOption | null) => setValue(item)}
      open={open}
      onOpenChange={setOpen}
      onItemHighlighted={onItemHighlighted}>
      <ComboboxInput placeholder='Straße suchen' aria-label='Straße' showClear className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>Keine Straße gefunden</ComboboxEmpty>
        <VirtualizedComboboxList open={open} virtualizerRef={virtualizerRef}>
          {(option: SelectOption) => <span>{option.label}</span>}
        </VirtualizedComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
