import { useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';

/** Twelve Tailwind 500 presets that read as a dot and as an icon stroke. Data colors, not theme tokens. */
export function ColorPickerDefault() {
  const [color, setColor] = useState<string | undefined>('#22c55e');
  return <ColorPicker value={color} onChange={setColor} />;
}
