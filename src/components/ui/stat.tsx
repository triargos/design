import type { ComponentProps } from 'react';

import { cn } from '~/lib/utils';

/** A number and what it counts. Children in reading order: label above or below the value. */
function Stat({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot='stat' className={cn('flex min-w-0 flex-col gap-tight', className)} {...props} />;
}

/** The number: the title role with tabular figures, so neighbouring stats line up. */
function StatValue({ className, ...props }: ComponentProps<'p'>) {
  return <p data-slot='stat-value' className={cn('text-title text-foreground tabular-nums', className)} {...props} />;
}

/** What the number counts. A `StatusDot` before the text ties it to a chart series. */
function StatLabel({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='stat-label'
      className={cn('flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Stat, StatLabel, StatValue };
