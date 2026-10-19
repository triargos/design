import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function FieldWithDescription() {
  return (
    <Field className='w-80'>
      <FieldLabel htmlFor='field-display-name'>Anzeigename</FieldLabel>
      <Input id='field-display-name' defaultValue='Erika Mustermann' />
      <FieldDescription>So erscheinst du in Nachrichten an die Klasse.</FieldDescription>
    </Field>
  );
}
