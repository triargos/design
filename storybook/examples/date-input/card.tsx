import { IsoDate } from '@elternportal/domain/iso-date';

import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';

/** `variant='card'`: a labelled card that opens the calendar. */
export function DateInputCard() {
  const [value, setValue] = useState<IsoDate | null>(IsoDate.fromDate(new Date(2025, 2, 14)));
  return (
    <DateInput
      variant='card'
      value={value}
      onChange={setValue}
      label='Erster Fehltag'
      placeholder='Datum wählen'
      className='w-64'
    />
  );
}
