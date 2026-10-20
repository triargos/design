import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';

/** Empty segments, or a word for the empty value. */
export function DateInputPlaceholder() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  return (
    <div className='flex flex-wrap gap-2'>
      <DateInput value={start} onValueChange={setStart} aria-label='Start date' className='w-48' />
      <DateInput value={end} onValueChange={setEnd} placeholder='No end date' aria-label='End date' className='w-48' />
    </div>
  );
}
