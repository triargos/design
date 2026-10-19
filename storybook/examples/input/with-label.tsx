import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function InputWithLabel() {
  return (
    <Field className='w-80'>
      <FieldLabel htmlFor='email'>E-Mail</FieldLabel>
      <Input id='email' type='email' placeholder='name@schule.de' />
      <FieldDescription>An diese Adresse schicken wir die Einladung.</FieldDescription>
    </Field>
  );
}
