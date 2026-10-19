import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** Label, control, description, error, in that order. Label to control: related. */
export function FieldDefault() {
  return (
    <Field className='w-80'>
      <FieldLabel htmlFor='field-name' required>
        Name
      </FieldLabel>
      <Input id='field-name' placeholder='Max Mustermann' />
    </Field>
  );
}
