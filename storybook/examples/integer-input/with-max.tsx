import { useState } from 'react';

import { IntegerInput } from '~/components/ui/integer-input';

/** `max` stops the stepper and clamps typed values; the minimum is always 0. */
export function IntegerInputWithMax() {
  const [seats, setSeats] = useState(8);
  return <IntegerInput value={seats} onValueChange={setSeats} unit='seats' max={10} aria-label='Seats' />;
}
