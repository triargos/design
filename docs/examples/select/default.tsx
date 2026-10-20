import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from '~/components/ui/select';

const STATUSES: ReadonlyArray<SelectOption> = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/** A field that opens a list. `items` gives the trigger the label of the value. */
export function SelectDefault() {
  const [status, setStatus] = useState<string | null>('in-progress');
  return (
    <Select items={STATUSES} value={status} onValueChange={setStatus}>
      <SelectTrigger aria-label='Status' className='w-56'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
