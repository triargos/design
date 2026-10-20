import type * as React from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

/**
 * A button that looks like a field, for a picker that opens a popup: the field surface, height, padding and text of
 * `Input` and `SelectTrigger`, so it lines up with them. Pass it as a trigger's `render` element, with the value in a
 * `<span>` (a bare text node cannot shrink, a span truncates) and an icon after it, at the end, muted like the
 * select chevron.
 */
function PickerTrigger({ className, type = 'button', ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type={type}
      data-slot='picker-trigger'
      className={cn(
        inputSurfaceVariants(),
        'flex h-10 w-full min-w-0 items-center justify-between gap-2 px-3.5 text-left text-control whitespace-nowrap',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&>span]:min-w-0 [&>span]:truncate",
        className,
      )}
      {...props}
    />
  );
}

export { PickerTrigger };
