import { ChevronsUpDownIcon } from 'lucide-react';

import { PickerTrigger } from '~/components/ui/picker-trigger';

export function PickerTriggerPlaceholder() {
  return (
    <PickerTrigger className='w-72 text-muted-foreground'>
      <span>Choose an assignee</span>
      <ChevronsUpDownIcon />
    </PickerTrigger>
  );
}
