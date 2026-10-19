import { useState } from 'react';

import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Slider } from '~/components/ui/slider';

/** No `SliderValue` part yet: the field shows the controlled value. */
export function SliderWithLabelAndValue() {
  const [zoom, setZoom] = useState(140);
  return (
    <Field className='w-80'>
      <div className='flex items-baseline justify-between'>
        <FieldLabel>Zoom</FieldLabel>
        <span className='text-caption text-muted-foreground tabular-nums'>{zoom}%</span>
      </div>
      <Slider value={zoom} onValueChange={(value) => setZoom(value)} min={100} max={300} step={10} />
      <FieldDescription>Wie im Bildzuschnitt für das Profilbild.</FieldDescription>
    </Field>
  );
}
