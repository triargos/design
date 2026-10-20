import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldLabel } from '~/components/ui/field';

export function CheckboxDisabled() {
  return (
    <Field orientation='horizontal' disabled>
      <Checkbox id='checkbox-locked' defaultChecked disabled />
      <FieldLabel htmlFor='checkbox-locked'>Set by the workspace owner</FieldLabel>
    </Field>
  );
}
