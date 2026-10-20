import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** `FieldError errors` lists them. */
export function FieldSeveralErrors() {
  return (
    <Field invalid className='w-80'>
      <FieldLabel htmlFor='field-password'>Password</FieldLabel>
      <Input id='field-password' type='password' defaultValue='abc' aria-invalid />
      <FieldError errors={[{ message: 'Use at least 12 characters.' }, { message: 'Add a number.' }]} />
    </Field>
  );
}
