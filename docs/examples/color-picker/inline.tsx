import { useState } from 'react';

import { ColorPicker } from '~/components/ui/color-picker';

import { cn } from '~/lib/utils';

/** `custom='inline'`: the custom picker in place, for a picker that already sits in a popup. */
export function ColorPickerInline() {
  const [color, setColor] = useState('#8b5cf6');
  return (
    <div className={cn('rounded-popup bg-popover text-popover-foreground shadow-popup', 'w-fit p-3')}>
      <ColorPicker value={color} onValueChange={setColor} custom='inline' />
    </div>
  );
}
