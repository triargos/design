import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { dataColorStyle, type Intent } from '~/components/ui/intent-variants';

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

type StatusDotProps = Omit<React.ComponentProps<'span'>, 'color'> &
  ({ intent?: Intent; color?: undefined } | { color: string; intent?: never });

/**
 * A state in one dot, next to a label that names it; the dot alone is decorative. `color` is a color from data (an
 * organization's category color: any CSS color or `var(--category-N)`), exclusive with `intent`; the dot is that color.
 */
function StatusDot({ className, style, intent, color, ...props }: StatusDotProps) {
  return (
    <span
      aria-hidden='true'
      data-slot='status-dot'
      className={cn(
        statusDotVariants({ intent: color === undefined ? intent : null }),
        color !== undefined && 'bg-(--data-color)',
        className,
      )}
      style={color === undefined ? style : { ...dataColorStyle(color), ...style }}
      {...props}
    />
  );
}

export { StatusDot };
