import { useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

/** Pills sit under their label; checkbox, radio and switch sit beside it. */
export function FieldPills() {
  const [value, setValue] = useState('week');
  return (
    <Field className='w-96'>
      <FieldLabel>Due</FieldLabel>
      <TabsRadioGroup value={value} onValueChange={setValue} aria-label='Due'>
        <TabsRadio value='day'>Today</TabsRadio>
        <TabsRadio value='week'>This week</TabsRadio>
        <TabsRadio value='month'>This month</TabsRadio>
      </TabsRadioGroup>
    </Field>
  );
}
