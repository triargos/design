import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '~/components/ui/field';

export function CheckboxInvalid() {
  return (
    <Field orientation='horizontal' data-invalid className='max-w-md'>
      <Checkbox id='privacy' aria-invalid />
      <FieldContent>
        <FieldLabel htmlFor='privacy'>Datenschutzerklärung gelesen</FieldLabel>
        <FieldError>Bitte bestätige die Datenschutzerklärung.</FieldError>
      </FieldContent>
    </Field>
  );
}
