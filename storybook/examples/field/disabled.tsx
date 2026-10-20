import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** `disabled` on the field mutes the label; the control takes its own `disabled`. */
export function FieldDisabled() {
  return (
    <Field disabled className='w-80'>
      <FieldLabel htmlFor='field-slug'>Workspace URL</FieldLabel>
      <Input id='field-slug' defaultValue='acme.example.com' disabled />
      <FieldDescription>Only owners can change it.</FieldDescription>
    </Field>
  );
}
