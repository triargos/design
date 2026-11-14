import type { ComponentProps } from 'react';

import { cn } from '~/lib/utils';

/** A dashed area to act on in an example: the target of a right-click, a drop. Pass it as a trigger's `render`. */
export function DemoArea({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
