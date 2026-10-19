import { Checkbox } from '~/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldLabel } from '~/components/ui/field';

export function CheckboxWithDescription() {
  return (
    <Field orientation='horizontal' className='max-w-md'>
      <Checkbox id='photos' defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor='photos'>Fotos erlaubt</FieldLabel>
        <FieldDescription>Die Schule darf Fotos meines Kindes auf der Website zeigen.</FieldDescription>
      </FieldContent>
    </Field>
  );
}
