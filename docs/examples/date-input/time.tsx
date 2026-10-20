import { useState } from 'react';

import { TimeInput } from '~/components/ui/date-input';

/** `TimeInput`: an `HH:mm` string (24-hour), or `''` when empty; the segments follow the locale's clock. */
export function DateInputTime() {
  const [start, setStart] = useState('09:30');
  const [end, setEnd] = useState('');
  return (
    <div className='flex flex-wrap gap-2'>
      <TimeInput value={start} onValueChange={setStart} aria-label='Start time' className='w-48' />
      <TimeInput value={end} onValueChange={setEnd} locale='de-DE' aria-label='End time' className='w-48' />
    </div>
  );
}
