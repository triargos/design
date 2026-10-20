import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';

/** Segments in the locale's order; the icon (or Alt+↓) opens the calendar. The value is `YYYY-MM-DD`. */
export function DateInputDefault() {
  const [value, setValue] = useState('2025-03-14');
  return <DateInput value={value} onValueChange={setValue} aria-label='Due date' className='w-48' />;
}
