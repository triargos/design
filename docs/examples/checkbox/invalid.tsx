import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '~/components/ui/field';

export function CheckboxInvalid() {
  return (
    <Field orientation='horizontal' invalid className='max-w-md'>
      <Checkbox id='checkbox-terms' aria-invalid />
      <FieldContent>
        <FieldLabel htmlFor='checkbox-terms'>I accept the terms of service</FieldLabel>
        <FieldError>Accept the terms to create the workspace.</FieldError>
      </FieldContent>
    </Field>
  );
}
