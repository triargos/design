import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** `data-invalid` on the field, `aria-invalid` on the control, `FieldError` last. */
export function FieldWithError() {
  return (
    <Field data-invalid className='w-80'>
      <FieldLabel htmlFor='field-required-name' required>
        Name
      </FieldLabel>
      <Input id='field-required-name' placeholder='Max Mustermann' aria-invalid />
      <FieldDescription>So erscheinst du in Nachrichten an die Klasse.</FieldDescription>
      <FieldError>Bitte gib deinen Namen ein.</FieldError>
    </Field>
  );
}
