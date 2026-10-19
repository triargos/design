import { CalendarIcon } from 'lucide-react';

import { PickerTrigger } from '~/components/ui/picker-trigger';

/** A button that looks like a field, for a picker that opens a popup. Wrap the value in a span so it truncates. */
export function PickerTriggerDefault() {
  return (
    <PickerTrigger className='w-72 justify-between'>
      <span>15. Januar 2026</span>
      <CalendarIcon className='opacity-50' />
    </PickerTrigger>
  );
}
