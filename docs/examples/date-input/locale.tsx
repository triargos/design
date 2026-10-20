import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';

/** `locale` sets the segment order and the calendar's names; the value stays `YYYY-MM-DD`. */
export function DateInputLocale() {
  const [value, setValue] = useState('2025-03-14');
  return (
    <div className='flex flex-wrap gap-2'>
      <DateInput value={value} onValueChange={setValue} locale='en-GB' aria-label='Due date, en-GB' className='w-48' />
      <DateInput value={value} onValueChange={setValue} locale='de-DE' aria-label='Due date, de-DE' className='w-48' />
    </div>
  );
}
