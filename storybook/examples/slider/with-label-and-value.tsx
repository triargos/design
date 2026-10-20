import { useId, useState } from 'react';

import { Field, FieldDescription, FieldLabel } from '~/components/ui/field';
import { Slider } from '~/components/ui/slider';

/** The field shows the controlled value beside the label. */
export function SliderWithLabelAndValue() {
  const [zoom, setZoom] = useState(140);
  const labelId = useId();
  return (
    <Field className='w-full max-w-80'>
      <div className='flex items-baseline justify-between'>
        <FieldLabel id={labelId}>Zoom</FieldLabel>
        <span className='text-caption text-muted-foreground tabular-nums'>{zoom}%</span>
      </div>
      <Slider
        aria-labelledby={labelId}
        value={zoom}
        onValueChange={(value) => setZoom(value)}
        min={100}
        max={300}
        step={10}
      />
      <FieldDescription>Crop your profile photo.</FieldDescription>
    </Field>
  );
}
