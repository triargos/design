import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { type Emphasis, type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

/**
 * A label for a state or a count: an `intent` at `subtle` (the default), `solid` (needs action) or `outline` (quiet,
 * dense lists). 24px, or 20px at `size='sm'`; `shape='pill'` for a count or a filter chip.
 */
const badgeShape = cva('inline-flex shrink-0 items-center justify-center gap-1 font-medium whitespace-nowrap', {
  variants: {
    size: {
      default: "h-6 px-2 text-caption [&_svg:not([class*='size-'])]:size-3.5",
      sm: "h-5 px-1.5 text-caption [&_svg:not([class*='size-'])]:size-3",
    },
    shape: {
      rounded: 'rounded-control-sm',
      pill: 'rounded-full',
    },
  },
});

type BadgeProps = React.ComponentProps<'div'> & {
  intent?: Intent;
  emphasis?: Extract<Emphasis, 'solid' | 'subtle' | 'outline'>;
  size?: 'default' | 'sm';
  shape?: 'rounded' | 'pill';
};

function Badge({
  className,
  intent = 'neutral',
  emphasis = 'subtle',
  size = 'default',
  shape = 'rounded',
  ...props
}: BadgeProps) {
  return (
    <div
      data-slot='badge'
      className={cn(intentVariants({ intent, emphasis }), badgeShape({ size, shape }), className)}
      {...props}
    />
  );
}

export { Badge };
