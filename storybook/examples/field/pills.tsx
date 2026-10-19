import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Pills sit under their label; checkbox, radio and switch sit beside it. */
export function FieldPills() {
  const [value, setValue] = useState('week');
  return (
    <Field className='w-96'>
      <FieldLabel>Zeitraum</FieldLabel>
      <TabsList as='radio' value={value} onValueChange={setValue} aria-label='Zeitraum'>
        <TabsTrigger value='day'>Heute</TabsTrigger>
        <TabsTrigger value='week'>Diese Woche</TabsTrigger>
        <TabsTrigger value='month'>Dieser Monat</TabsTrigger>
      </TabsList>
    </Field>
  );
}
