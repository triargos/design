import { Field, FieldError } from '~/components/ui/field';
import { ChoiceCard, RadioGroup } from '~/components/ui/radio-group';

const PLANS = ['Free', 'Team', 'Business', 'Enterprise'] as const;

/** Not chosen yet, submitted. */
export function RadioGroupInvalid() {
  return (
    <Field invalid className='max-w-md'>
      <RadioGroup aria-label='Plan' className='sm:grid-cols-2'>
        {PLANS.map((plan) => (
          <ChoiceCard key={plan} value={plan} aria-invalid>
            {plan}
          </ChoiceCard>
        ))}
      </RadioGroup>
      <FieldError>Choose a plan.</FieldError>
    </Field>
  );
}
