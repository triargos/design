import { Field, FieldLabel } from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

export function RadioGroupDisabled() {
  return (
    <RadioGroup defaultValue='parent' disabled aria-label='Abholung'>
      <Field orientation='horizontal' data-disabled>
        <RadioGroupItem id='disabled-parent' value='parent' />
        <FieldLabel htmlFor='disabled-parent' className='font-normal'>
          Durch ein Elternteil
        </FieldLabel>
      </Field>
      <Field orientation='horizontal' data-disabled>
        <RadioGroupItem id='disabled-alone' value='alone' />
        <FieldLabel htmlFor='disabled-alone' className='font-normal'>
          Allein nach Hause
        </FieldLabel>
      </Field>
    </RadioGroup>
  );
}
