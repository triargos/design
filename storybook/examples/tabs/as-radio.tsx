import { useState } from 'react';

import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

/** A single choice: radios, every pill a tab stop. */
export function TabsAsRadio() {
  const [value, setValue] = useState('week');
  return (
    <TabsRadioGroup value={value} onValueChange={setValue} aria-label='Period'>
      <TabsRadio value='day'>Today</TabsRadio>
      <TabsRadio value='week'>This week</TabsRadio>
      <TabsRadio value='month'>This month</TabsRadio>
      <TabsRadio value='year'>This year</TabsRadio>
    </TabsRadioGroup>
  );
}
