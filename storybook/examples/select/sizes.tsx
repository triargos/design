import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/** `size='sm'` (36px) in toolbars and filters, next to sm buttons. */
export function SelectSizes() {
  return (
    <div className='flex items-center gap-2'>
      <Select items={STATUSES} defaultValue='todo'>
        <SelectTrigger size='sm' aria-label='Status, small' className='w-40'>
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
      <Select items={STATUSES} defaultValue='todo'>
        <SelectTrigger aria-label='Status' className='w-40'>
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
    </div>
  );
}
