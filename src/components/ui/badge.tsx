import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { type Emphasis, type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

/**
 * A label for a state or a count: an `intent` at `subtle` (the default), `solid` (needs action) or `outline` (quiet,
 * dense lists). Four sizes; corners follow the height like `Button`'s (`rounded-control*`); `shape='pill'` for a count or a
 * filter chip.
 */
const badgeShape = cva('inline-flex shrink-0 items-center justify-center gap-1 font-medium whitespace-nowrap', {
  variants: {
    size: {
      sm: "h-5 px-1.5 text-caption [&_svg:not([class*='size-'])]:size-3",
      md: "h-6 px-2 text-caption [&_svg:not([class*='size-'])]:size-3.5",
      lg: "h-7 px-2.5 text-control [&_svg:not([class*='size-'])]:size-4",
      xl: "h-8 px-3 text-control [&_svg:not([class*='size-'])]:size-4",
    },
    shape: {
      rounded: '',
      pill: 'rounded-full',
    },
  },
  compoundVariants: [
    { shape: 'rounded', size: ['sm', 'md', 'lg'], className: 'rounded-control-sm' },
    { shape: 'rounded', size: 'xl', className: 'rounded-control' },
  ],
});

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';
type BadgeShape = 'rounded' | 'pill';

interface BadgeStyle {
  intent: Intent;
  /** `ghost` only for the old `ghost` variant. */
  emphasis: Extract<Emphasis, 'solid' | 'subtle' | 'outline' | 'ghost'>;
  size: BadgeSize;
  shape: BadgeShape;
  className?: string;
}

const DEFAULT_STYLE: BadgeStyle = { intent: 'neutral', emphasis: 'subtle', size: 'md', shape: 'rounded' };

/** The names before `intent` × `emphasis`. Kept until the app migrates; each keeps its old pill, height and weight. */
const VARIANTS = {
  default: { intent: 'neutral', emphasis: 'outline', size: 'md', shape: 'pill', className: 'font-normal' },
  secondary: { intent: 'neutral', emphasis: 'subtle', size: 'md', shape: 'pill', className: 'font-normal' },
  outline: { intent: 'neutral', emphasis: 'outline', size: 'md', shape: 'pill', className: 'font-normal' },
  /** @deprecated Renders as `outline`; use `intent='success'` for a positive state. */
  green: { intent: 'neutral', emphasis: 'outline', size: 'md', shape: 'pill', className: 'font-normal' },
  destructive: { intent: 'destructive', emphasis: 'outline', size: 'md', shape: 'pill' },
  ghost: {
    intent: 'neutral',
    emphasis: 'ghost',
    size: 'md',
    shape: 'pill',
    className: 'font-normal text-muted-foreground',
  },
  muted: { intent: 'neutral', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  success: { intent: 'success', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  warning: { intent: 'warning', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  info: { intent: 'info', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  danger: { intent: 'destructive', emphasis: 'subtle', size: 'sm', shape: 'pill' },
} satisfies Record<string, BadgeStyle>;

type BadgeProps = React.ComponentProps<'div'> & {
  /** @deprecated Use `intent`, `emphasis`, `size` and `shape`. */
  variant?: keyof typeof VARIANTS;
  intent?: Intent;
  emphasis?: Extract<Emphasis, 'solid' | 'subtle' | 'outline'>;
  size?: BadgeSize;
  shape?: BadgeShape;
};

function Badge({ className, variant, intent, emphasis, size, shape, ...props }: BadgeProps) {
  const base: BadgeStyle = variant ? VARIANTS[variant] : DEFAULT_STYLE;
  return (
    <div
      data-slot='badge'
      className={cn(
        intentVariants({ intent: intent ?? base.intent, emphasis: emphasis ?? base.emphasis }),
        badgeShape({ size: size ?? base.size, shape: shape ?? base.shape }),
        base.className,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
