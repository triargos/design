import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function FieldDisabled() {
  return (
    <Field data-disabled className='w-80'>
      <FieldLabel htmlFor='field-locked'>Name</FieldLabel>
      <Input id='field-locked' defaultValue='Erika Mustermann' disabled />
    </Field>
  );
}
