import { useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

/** `custom='inline'`: the custom picker in place, for a picker that already sits in a popup. */
export function ColorPickerInline() {
  const [color, setColor] = useState<string | undefined>('#8b5cf6');
  return (
    <div className={cn(popupSurface, 'w-fit p-3')}>
      <ColorPicker value={color} onChange={setColor} custom='inline' aria-label='Farbe' />
    </div>
  );
}
