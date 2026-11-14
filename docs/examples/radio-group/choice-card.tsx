import { useState } from 'react';

import { ChoiceCard, RadioGroup } from '~/components/ui/radio-group';

const PLANS = ['Free', 'Team', 'Business', 'Enterprise'] as const;

/** The radio as a card, for a few choices that deserve room. */
export function RadioGroupChoiceCard() {
  const [value, setValue] = useState<string>(PLANS[1]);
  return (
    <RadioGroup
      aria-label='Plan'
      value={value}
      onValueChange={(next) => setValue(String(next))}
      columns={2}
      className='max-w-md'>
      {PLANS.map((plan) => (
        <ChoiceCard key={plan} value={plan}>
          {plan}
        </ChoiceCard>
      ))}
    </RadioGroup>
  );
}
