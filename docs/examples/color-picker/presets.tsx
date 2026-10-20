import { useState } from 'react';

import { ColorPicker, type ColorPreset } from '~/components/ui/color-picker';

const TEAM_COLORS: ReadonlyArray<ColorPreset> = [
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#a855f7', label: 'Purple' },
];

/** Your own swatches; `custom={false}` keeps the choice to them. */
export function ColorPickerPresets() {
  const [color, setColor] = useState('#10b981');
  return (
    <ColorPicker presets={TEAM_COLORS} custom={false} value={color} onValueChange={setColor} aria-label='Team color' />
  );
}
