import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Calendar } from '~/components/ui/calendar';

export function CalendarRange() {
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2025, 2, 10), to: new Date(2025, 2, 14) });
  return <Calendar mode='range' selected={range} onSelect={setRange} defaultMonth={new Date(2025, 2, 1)} />;
}
