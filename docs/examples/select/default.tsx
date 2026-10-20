import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/** A field that opens a list. `items` lets `SelectValue` show the label. */
export function SelectDefault() {
  return (
    <Select items={STATUSES} defaultValue='in-progress'>
      <SelectTrigger aria-label='Status' className='w-56'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
