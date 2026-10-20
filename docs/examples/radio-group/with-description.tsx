import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const DIGESTS = [
  { value: 'daily', label: 'Daily', description: 'One email in the morning with everything from the day before.' },
  { value: 'instant', label: 'Instantly', description: 'Each update on its own, as it happens.' },
  { value: 'never', label: 'Never', description: 'Updates stay in the inbox, no email.' },
] as const;

export function RadioGroupWithDescription() {
  return (
    <FieldSet className='max-w-md'>
      <FieldLegend>Email updates</FieldLegend>
      <RadioGroup defaultValue='daily'>
        {DIGESTS.map((digest) => (
          <Field key={digest.value} orientation='horizontal'>
            <RadioGroupItem id={`digest-${digest.value}`} value={digest.value} />
            <FieldContent>
              <FieldLabel htmlFor={`digest-${digest.value}`}>{digest.label}</FieldLabel>
              <FieldDescription>{digest.description}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
