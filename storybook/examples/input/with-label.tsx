import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function InputWithLabel() {
  return (
    <Field className='w-80'>
      <FieldLabel htmlFor='input-email'>Email</FieldLabel>
      <Input id='input-email' type='email' placeholder='name@example.com' />
      <FieldDescription>We send the invitation to this address.</FieldDescription>
    </Field>
  );
}
