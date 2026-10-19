import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldLabel } from '~/components/ui/field';

export function CheckboxDisabled() {
  return (
    <Field orientation='horizontal' data-disabled>
      <Checkbox id='locked' defaultChecked disabled />
      <FieldLabel htmlFor='locked'>Vom Sekretariat festgelegt</FieldLabel>
    </Field>
  );
}
