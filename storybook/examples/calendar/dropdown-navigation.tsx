import { useState } from 'react';

import { Calendar } from '~/components/ui/calendar';

/** `captionLayout='dropdown'`: month and year as selects, for a date far away (a birthday). */
export function CalendarDropdownNavigation() {
  const [date, setDate] = useState<Date | undefined>(new Date(2017, 5, 3));
  return (
    <Calendar
      mode='single'
      captionLayout='dropdown'
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2017, 5, 1)}
      startMonth={new Date(2005, 0)}
      endMonth={new Date(2025, 11)}
    />
  );
}
