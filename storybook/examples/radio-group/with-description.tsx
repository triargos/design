import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const PLANS = [
  { value: 'daily', label: 'Täglich', description: 'Eine E-Mail am Morgen mit allem vom Vortag.' },
  { value: 'instant', label: 'Sofort', description: 'Jede Nachricht einzeln, sobald sie eintrifft.' },
  { value: 'never', label: 'Nie', description: 'Nur im Elternportal, keine E-Mails.' },
] as const;

export function RadioGroupWithDescription() {
  return (
    <FieldSet className='max-w-md'>
      <FieldLegend variant='label'>E-Mail-Benachrichtigungen</FieldLegend>
      <RadioGroup defaultValue='daily'>
        {PLANS.map((plan) => (
          <Field key={plan.value} orientation='horizontal'>
            <RadioGroupItem id={`plan-${plan.value}`} value={plan.value} />
            <FieldContent>
              <FieldLabel htmlFor={`plan-${plan.value}`}>{plan.label}</FieldLabel>
              <FieldDescription>{plan.description}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
