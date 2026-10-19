import { useState } from 'react';

import { TimeInput } from '~/components/ui/time-input';

/** A time as an `HH:mm` string, or `''` when empty. */
export function TimeInputDefault() {
  const [value, setValue] = useState('08:30');
  return <TimeInput value={value} onChange={setValue} aria-label='Uhrzeit' className='w-48' />;
}
