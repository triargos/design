import { useId, useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';
import { Field, FieldDescription, FieldTitle } from '~/components/ui/field';

/** `FieldTitle` names it through aria-labelledby. */
export function ColorPickerInAField() {
  const labelId = useId();
  const [color, setColor] = useState('#22c55e');
  return (
    <Field className='w-80'>
      <FieldTitle id={labelId}>Project color</FieldTitle>
      <ColorPicker value={color} onValueChange={setColor} aria-labelledby={labelId} />
      <FieldDescription>Shows as a dot next to the project name.</FieldDescription>
    </Field>
  );
}
