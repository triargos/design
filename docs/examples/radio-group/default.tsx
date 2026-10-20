import { Field, FieldLabel, FieldLegend, FieldSet } from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const ACCESS = [
  { value: 'members', label: 'All members' },
  { value: 'team', label: 'Project team only' },
  { value: 'private', label: 'Only me' },
] as const;

export function RadioGroupDefault() {
  return (
    <FieldSet className='max-w-md'>
      <FieldLegend>Who can see this project</FieldLegend>
      <RadioGroup defaultValue='members'>
        {ACCESS.map((option) => (
          <Field key={option.value} orientation='horizontal'>
            <RadioGroupItem id={`access-${option.value}`} value={option.value} />
            <FieldLabel htmlFor={`access-${option.value}`} className='font-normal'>
              {option.label}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
