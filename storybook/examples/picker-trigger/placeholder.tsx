import { ChevronsUpDownIcon } from 'lucide-react';

import { PickerTrigger } from '~/components/ui/picker-trigger';

export function PickerTriggerPlaceholder() {
  return (
    <PickerTrigger className='w-72 justify-between text-muted-foreground'>
      <span>Schüler wählen</span>
      <ChevronsUpDownIcon className='opacity-50' />
    </PickerTrigger>
  );
}
