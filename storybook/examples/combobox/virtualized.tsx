import { useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxVirtualizedList,
} from '~/components/ui/combobox';
import type { SelectOption } from '~/components/ui/select';

const AREAS = ['Billing', 'Onboarding', 'Search', 'Settings', 'Invoices', 'Reports', 'Members'];

const TASKS: ReadonlyArray<SelectOption> = Array.from({ length: 2100 }, (_, index) => ({
  value: String(index + 1),
  label: `${AREAS[index % AREAS.length]} task ${Math.floor(index / AREAS.length) + 1}`,
}));

/** `virtualized` + `ComboboxVirtualizedList`: only the rows in view render. What Search Select builds on. */
export function ComboboxVirtualized() {
  const [value, setValue] = useState<SelectOption | null>(TASKS[24]!);
  return (
    <Combobox
      virtualized
      items={TASKS}
      itemToStringValue={(task: SelectOption) => task.label}
      value={value}
      onValueChange={(task: SelectOption | null) => setValue(task)}>
      <ComboboxInput placeholder='Search tasks' aria-label='Task' className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>No tasks found</ComboboxEmpty>
        <ComboboxVirtualizedList>{(task: SelectOption) => <span>{task.label}</span>}</ComboboxVirtualizedList>
      </ComboboxContent>
    </Combobox>
  );
}
