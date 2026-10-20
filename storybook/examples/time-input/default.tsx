import { useState } from 'react';

import { TimeInput } from '~/components/ui/time-input';

/** A time as an `HH:mm` string (24-hour), or `''` when empty; the segments follow the locale's clock. */
export function TimeInputDefault() {
  const [value, setValue] = useState('09:30');
  return <TimeInput value={value} onValueChange={setValue} aria-label='Start time' className='w-48' />;
}
