import { useState } from 'react';

import { IntegerInput } from '~/components/ui/integer-input';

export function IntegerInputDefault() {
  const [days, setDays] = useState(30);
  return <IntegerInput value={days} onValueChange={setDays} unit='days' aria-label='Payment terms' />;
}
