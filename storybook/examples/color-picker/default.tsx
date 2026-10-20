import { useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';

/** Twelve presets that read as a dot and as an icon stroke. Data colors, not theme tokens. */
export function ColorPickerDefault() {
  const [color, setColor] = useState('#22c55e');
  return <ColorPicker value={color} onValueChange={setColor} />;
}
