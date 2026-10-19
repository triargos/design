import { cva } from 'class-variance-authority';
import type * as React from 'react';

import type { Intent } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

/** The intent's hue as a dot: a bare intent token is allowed here, a dot is not a fill behind text. */
const statusDotVariants = cva('inline-flex size-2 shrink-0 rounded-full', {
  variants: {
    intent: {
      neutral: 'bg-faint-foreground',
      primary: 'bg-primary-solid',
      info: 'bg-info',
      success: 'bg-success',
      warning: 'bg-warning',
      destructive: 'bg-destructive',
    } satisfies Record<Intent, string>,
  },
  defaultVariants: { intent: 'neutral' },
});

type StatusDotProps = React.ComponentProps<'span'> & { intent?: Intent };

/** A state in one dot, next to a label that names it; the dot alone is decorative. */
function StatusDot({ className, intent, ...props }: StatusDotProps) {
  return (
    <span
      aria-hidden='true'
      data-slot='status-dot'
      className={cn(statusDotVariants({ intent }), className)}
      {...props}
    />
  );
}

export { StatusDot, type StatusDotProps };
