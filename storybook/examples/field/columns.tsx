import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** Two columns for short peers. */
export function FieldColumns() {
  return (
    <FieldGroup columns={2} className='w-full max-w-md'>
      <Field>
        <FieldLabel htmlFor='field-first'>Vorname</FieldLabel>
        <Input id='field-first' defaultValue='Erika' />
      </Field>
      <Field>
        <FieldLabel htmlFor='field-last'>Nachname</FieldLabel>
        <Input id='field-last' defaultValue='Mustermann' />
      </Field>
    </FieldGroup>
  );
}
