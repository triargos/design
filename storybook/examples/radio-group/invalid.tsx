import { Field, FieldError } from '~/components/ui/field';
import { ChoiceCard, RadioGroup } from '~/components/ui/radio-group';

const REASONS = ['Krankheit', 'Arzttermin', 'Familiärer Anlass', 'Sonstiges'] as const;

/** Not chosen yet, submitted. */
export function RadioGroupInvalid() {
  return (
    <Field data-invalid className='max-w-md'>
      <RadioGroup aria-label='Grund der Abwesenheit' className='sm:grid-cols-2'>
        {REASONS.map((reason) => (
          <ChoiceCard key={reason} value={reason} aria-invalid>
            {reason}
          </ChoiceCard>
        ))}
      </RadioGroup>
      <FieldError>Bitte wähle einen Grund.</FieldError>
    </Field>
  );
}
