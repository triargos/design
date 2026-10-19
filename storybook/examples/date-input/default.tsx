import { IsoDate } from '~/lib/iso-date';

import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';

/** Segments in the locale order (dd.MM.yyyy in de); the icon opens the calendar. The value is an `IsoDate`. */
export function DateInputDefault() {
  const [value, setValue] = useState<IsoDate | null>(IsoDate.fromDate(new Date(2025, 2, 14)));
  return <DateInput value={value} onChange={setValue} aria-label='Datum' className='w-48' />;
}
