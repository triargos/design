import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function InputFile() {
  return (
    <Field className='w-80'>
      <FieldLabel htmlFor='certificate'>Bescheinigung</FieldLabel>
      <Input id='certificate' type='file' />
    </Field>
  );
}
