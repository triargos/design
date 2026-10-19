import { useState } from 'react';

import { IntegerStepper } from '~/components/ui/integer-input';

export function IntegerInputDefault() {
  const [days, setDays] = useState(14);
  return <IntegerStepper value={days} onChange={setDays} unit='Tage' aria-label='Frist in Tagen' />;
}
