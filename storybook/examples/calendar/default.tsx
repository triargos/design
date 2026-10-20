import { useState } from 'react';

import { Calendar } from '~/components/ui/calendar';

/** A day as `YYYY-MM-DD`; it opens on the value's month. Date Input opens it in a popup. */
export function CalendarDefault() {
  const [date, setDate] = useState('2025-03-14');
  return <Calendar value={date} onValueChange={setDate} />;
}
