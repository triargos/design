import { Field, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** Two columns for short peers. */
export function FieldColumns() {
  return (
    <FieldGroup columns={2} className='w-full max-w-md'>
      <Field>
        <FieldLabel htmlFor='field-first'>First name</FieldLabel>
        <Input id='field-first' defaultValue='Maya' />
      </Field>
      <Field>
        <FieldLabel htmlFor='field-last'>Last name</FieldLabel>
        <Input id='field-last' defaultValue='Chen' />
      </Field>
    </FieldGroup>
  );
}
