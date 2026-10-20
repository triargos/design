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

/** `size='sm'` (36px) in toolbars and filters, next to `sm` buttons. */
export function SelectSizes() {
  const [status, setStatus] = useState<string | null>('todo');
  return (
    <div className='flex items-center gap-2'>
      {(['sm', 'default'] as const).map((size) => (
        <Select key={size} items={STATUSES} value={status} onValueChange={setStatus}>
          <SelectTrigger size={size} aria-label={`Status, ${size}`} className='w-40'>
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
      ))}
    </div>
  );
}
