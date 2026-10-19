import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldLabel } from '~/components/ui/field';

export function CheckboxWithLabel() {
  return (
    <Field orientation='horizontal'>
      <Checkbox id='terms' />
      <FieldLabel htmlFor='terms'>Nutzungsbedingungen akzeptieren</FieldLabel>
    </Field>
  );
}
