import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function FieldWithDescription() {
  return (
    <Field className='w-80'>
      <FieldLabel htmlFor='field-display-name'>Display name</FieldLabel>
      <Input id='field-display-name' defaultValue='Maya Chen' />
      <FieldDescription>Shown on your comments and tasks.</FieldDescription>
    </Field>
  );
}
