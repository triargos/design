import { IsoDate } from '@elternportal/domain/iso-date';

import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';
import { TimeInput } from '~/components/ui/time-input';

export function DateInputInAForm() {
  const [from, setFrom] = useState<IsoDate | null>(IsoDate.fromDate(new Date(2025, 2, 14)));
  const [time, setTime] = useState('08:00');
  return (
    <FieldGroup columns={2} className='w-full max-w-md'>
      <Field>
        <FieldLabel htmlFor='absence-from'>Erster Fehltag</FieldLabel>
        <DateInput id='absence-from' value={from} onChange={setFrom} />
      </Field>
      <Field>
        <FieldLabel htmlFor='absence-time'>Ab</FieldLabel>
        <TimeInput id='absence-time' value={time} onChange={setTime} />
      </Field>
    </FieldGroup>
  );
}
