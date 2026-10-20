import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '~/components/ui/field';

const EVENTS = ['Comments', 'Assigned tasks', 'Due dates'] as const;

export function CheckboxGroup() {
  return (
    <FieldSet className='max-w-md'>
      <FieldLegend>Notify me about</FieldLegend>
      <FieldGroup className='gap-related'>
        {EVENTS.map((label, index) => (
          <Field key={label} orientation='horizontal'>
            <Checkbox id={`notify-${index}`} defaultChecked={index !== 2} />
            <FieldLabel htmlFor={`notify-${index}`} className='font-normal'>
              {label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}
