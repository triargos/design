import { ColorPicker } from '~/components/ui/color-picker';
import { Field, FieldDescription, FieldTitle } from '~/components/ui/field';

/** A control that is not an input (a color picker, a button group) is named by `FieldTitle` through aria-labelledby. */
export function FieldWithTitle() {
  return (
    <Field aria-labelledby='field-color-title' className='w-80'>
      <FieldTitle id='field-color-title'>Farbe</FieldTitle>
      <ColorPicker value='#64c989' onChange={() => undefined} />
      <FieldDescription>Erscheint als Punkt neben der Kategorie.</FieldDescription>
    </Field>
  );
}
