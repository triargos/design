import { useState } from 'react';

import { type DateRange, RangeCalendar } from '~/components/ui/calendar';

/** The first click sets the start, the second the end. */
export function CalendarRange() {
  const [range, setRange] = useState<DateRange | null>({ start: '2025-03-10', end: '2025-03-14' });
  return <RangeCalendar value={range} onValueChange={setRange} />;
}
