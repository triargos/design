import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** `invalid` on the field, `aria-invalid` on the control, `FieldError` last. */
export function FieldWithError() {
  return (
    <Field invalid className='w-80'>
      <FieldLabel htmlFor='field-required-name' required>
        Project name
      </FieldLabel>
      <Input id='field-required-name' placeholder='Website redesign' required aria-invalid />
      <FieldDescription>Members see it in the sidebar.</FieldDescription>
      <FieldError>Enter a project name.</FieldError>
    </Field>
  );
}
