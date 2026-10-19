import { ChevronsUpDownIcon } from 'lucide-react';

import { PickerTrigger } from '~/components/ui/picker-trigger';

/** No read-only: a picker that cannot change is plain text. */
export function PickerTriggerStates() {
  return (
    <div className='grid w-72 gap-2'>
      <PickerTrigger aria-invalid className='justify-between text-muted-foreground'>
        <span>Schüler wählen</span>
        <ChevronsUpDownIcon className='opacity-50' />
      </PickerTrigger>
      <PickerTrigger disabled className='justify-between'>
        <span>Erika Mustermann</span>
        <ChevronsUpDownIcon className='opacity-50' />
      </PickerTrigger>
    </div>
  );
}
