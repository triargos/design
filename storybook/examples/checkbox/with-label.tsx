import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldLabel } from '~/components/ui/field';

export function CheckboxWithLabel() {
  return (
    <Field orientation='horizontal'>
      <Checkbox id='checkbox-archive' />
      <FieldLabel htmlFor='checkbox-archive'>Archive completed tasks</FieldLabel>
    </Field>
  );
}
