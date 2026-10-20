import type * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

/**
 * A button that looks like a field, for pickers that open a popup (the date picker): the field surface, 40px height,
 * padding and text of `Input` and `SelectTrigger`, so it lines up with them. Pass it as a trigger's `render` element.
 * Wrap the value in a `<span>`: a bare text node cannot shrink, so a long value would push the icon out; a span truncates.
 */
function PickerTrigger({ className, type = 'button', ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type={type}
      data-slot='picker-trigger'
      className={cn(
        inputSurfaceVariants(),
        'flex h-10 w-full min-w-0 items-center gap-2 px-3.5 text-left text-control whitespace-nowrap',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:min-w-0 [&>span]:truncate",
        className,
      )}
      {...props}
    />
  );
}

export { PickerTrigger };
