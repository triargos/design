import { useState } from 'react';

import { ChoiceCard, RadioGroup } from '~/components/ui/radio-group';

const REASONS = ['Krankheit', 'Arzttermin', 'Familiärer Anlass', 'Sonstiges'] as const;

/** The radio as a card, for a few choices that deserve room. */
export function RadioGroupChoiceCard() {
  const [value, setValue] = useState<string>(REASONS[0]);
  return (
    <RadioGroup
      aria-label='Grund der Abwesenheit'
      value={value}
      onValueChange={(next) => setValue(String(next))}
      className='max-w-md sm:grid-cols-2'>
      {REASONS.map((reason) => (
        <ChoiceCard key={reason} value={reason}>
          {reason}
        </ChoiceCard>
      ))}
    </RadioGroup>
  );
}
