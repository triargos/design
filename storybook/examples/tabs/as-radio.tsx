import { useState } from 'react';

import { TabsList, TabsTrigger } from '~/components/ui/tabs';

/** A single choice: radios, every pill a tab stop. */
export function TabsAsRadio() {
  const [value, setValue] = useState('week');
  return (
    <TabsList as='radio' value={value} onValueChange={setValue} aria-label='Zeitraum'>
      <TabsTrigger value='day'>Heute</TabsTrigger>
      <TabsTrigger value='week'>Diese Woche</TabsTrigger>
      <TabsTrigger value='month'>Dieser Monat</TabsTrigger>
      <TabsTrigger value='year'>Schuljahr</TabsTrigger>
    </TabsList>
  );
}
