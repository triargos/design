import { useState } from 'react';

import { IntegerStepper } from '~/components/ui/integer-input';

/** `max` stops the stepper and clamps typed values; the minimum is always 0. */
export function IntegerInputWithMax() {
  const [seats, setSeats] = useState(28);
  return <IntegerStepper value={seats} onChange={setSeats} unit='Plätze' max={30} aria-label='Plätze pro Klasse' />;
}
