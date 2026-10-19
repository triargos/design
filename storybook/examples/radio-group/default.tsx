import { Field, FieldLabel, FieldLegend, FieldSet } from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const PICKUP = [
  { value: 'parent', label: 'Durch ein Elternteil' },
  { value: 'alone', label: 'Allein nach Hause' },
  { value: 'care', label: 'Nachmittagsbetreuung' },
] as const;

export function RadioGroupDefault() {
  return (
    <FieldSet className='max-w-md'>
      <FieldLegend variant='label'>Abholung</FieldLegend>
      <RadioGroup defaultValue='parent'>
        {PICKUP.map((option) => (
          <Field key={option.value} orientation='horizontal'>
            <RadioGroupItem id={`pickup-${option.value}`} value={option.value} />
            <FieldLabel htmlFor={`pickup-${option.value}`} className='font-normal'>
              {option.label}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
