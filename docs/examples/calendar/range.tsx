import { useState } from 'react';

import { Calendar, type DateRange } from '~/components/ui/calendar';

/** `mode='range'`: the first click sets the start, the second the end. */
export function CalendarRange() {
  const [range, setRange] = useState<DateRange | null>({ start: '2025-03-10', end: '2025-03-14' });
  return <Calendar mode='range' value={range} onValueChange={setRange} />;
}
