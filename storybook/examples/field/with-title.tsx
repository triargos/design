import { ColorPicker } from '~/components/ui/color-picker';
import { Field, FieldDescription, FieldTitle } from '~/components/ui/field';

/** A control that is not an input (a color picker, a button group) is named by `FieldTitle` through aria-labelledby. */
export function FieldWithTitle() {
  return (
    <Field aria-labelledby='field-color-title' className='w-80'>
      <FieldTitle id='field-color-title'>Color</FieldTitle>
      <ColorPicker value='#64c989' onValueChange={() => undefined} />
      <FieldDescription>Shown as a dot next to the project name.</FieldDescription>
    </Field>
  );
}
