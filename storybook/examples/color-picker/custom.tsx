import { useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';

/** Any other hex shows as the custom swatch; it opens a picker in a popover. */
export function ColorPickerCustom() {
  const [color, setColor] = useState<string | undefined>('#d3d3d3');
  return <ColorPicker value={color} onChange={setColor} />;
}
