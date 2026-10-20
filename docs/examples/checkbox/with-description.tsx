import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldLabel } from '~/components/ui/field';

export function CheckboxWithDescription() {
  return (
    <Field orientation='horizontal' className='max-w-md'>
      <Checkbox id='checkbox-guests' defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor='checkbox-guests'>Allow guests</FieldLabel>
        <FieldDescription>People outside the workspace can view shared documents.</FieldDescription>
      </FieldContent>
    </Field>
  );
}
