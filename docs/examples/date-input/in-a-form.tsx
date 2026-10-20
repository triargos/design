import { useState } from 'react';

import { DateInput, TimeInput } from '~/components/ui/date-input';
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';

export function DateInputInAForm() {
  const [date, setDate] = useState('2025-03-14');
  const [time, setTime] = useState('09:30');
  return (
    <FieldGroup columns={2} className='w-full max-w-md'>
      <Field>
        <FieldLabel htmlFor='meeting-date'>Date</FieldLabel>
        <DateInput id='meeting-date' value={date} onValueChange={setDate} />
      </Field>
      <Field>
        <FieldLabel htmlFor='meeting-time'>Start</FieldLabel>
        <TimeInput id='meeting-time' value={time} onValueChange={setTime} />
      </Field>
    </FieldGroup>
  );
}
