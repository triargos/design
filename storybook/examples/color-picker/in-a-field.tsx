import { useId, useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';
import { Field, FieldDescription, FieldTitle } from '~/components/ui/field';

/** `FieldTitle` names it through aria-labelledby. */
export function ColorPickerInAField() {
  const labelId = useId();
  const [color, setColor] = useState<string | undefined>('#22c55e');
  return (
    <Field className='w-80'>
      <FieldTitle id={labelId}>Farbe</FieldTitle>
      <ColorPicker value={color} onChange={setColor} aria-labelledby={labelId} />
      <FieldDescription>Erscheint als Punkt neben der Kategorie und dem Status.</FieldDescription>
    </Field>
  );
}
