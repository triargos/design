import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** `FieldError errors` lists them. */
export function FieldSeveralErrors() {
  return (
    <Field data-invalid className='w-80'>
      <FieldLabel htmlFor='field-password'>Passwort</FieldLabel>
      <Input id='field-password' type='password' defaultValue='abc' aria-invalid />
      <FieldError errors={[{ message: 'Mindestens 12 Zeichen.' }, { message: 'Mindestens eine Ziffer.' }]} />
    </Field>
  );
}
