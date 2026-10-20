import { ChevronsUpDownIcon } from 'lucide-react';

import { PickerTrigger } from '~/components/ui/picker-trigger';

/** No read-only: a picker that cannot change is plain text. */
export function PickerTriggerStates() {
  return (
    <div className='grid w-72 gap-2'>
      <PickerTrigger aria-invalid className='text-muted-foreground'>
        <span>Choose an assignee</span>
        <ChevronsUpDownIcon />
      </PickerTrigger>
      <PickerTrigger disabled>
        <span>Maya Chen</span>
        <ChevronsUpDownIcon />
      </PickerTrigger>
    </div>
  );
}
