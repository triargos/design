import { useState } from 'react';

import { Calendar } from '~/components/ui/calendar';

/** react-day-picker in our shape. DateInput opens it. */
export function CalendarDefault() {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 2, 14));
  return <Calendar mode='single' selected={date} onSelect={setDate} defaultMonth={new Date(2025, 2, 1)} />;
}
