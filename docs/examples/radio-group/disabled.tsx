import { Field, FieldLabel } from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

export function RadioGroupDisabled() {
  return (
    <RadioGroup defaultValue='members' disabled aria-label='Who can see this project'>
      <Field orientation='horizontal' disabled>
        <RadioGroupItem id='disabled-members' value='members' />
        <FieldLabel htmlFor='disabled-members' className='font-normal'>
          All members
        </FieldLabel>
      </Field>
      <Field orientation='horizontal' disabled>
        <RadioGroupItem id='disabled-private' value='private' />
        <FieldLabel htmlFor='disabled-private' className='font-normal'>
          Only me
        </FieldLabel>
      </Field>
    </RadioGroup>
  );
}
