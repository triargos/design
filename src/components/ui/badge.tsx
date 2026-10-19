import { cva } from 'class-variance-authority';
import * as React from 'react';

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
  defaultVariants: { size: 'md', shape: 'rounded' },
});

type BadgeEmphasis = Extract<Emphasis, 'solid' | 'subtle' | 'outline' | 'ghost'>;
type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';
type BadgeShape = 'rounded' | 'pill';

interface BadgeStyle {
  intent: Intent;
  emphasis: BadgeEmphasis;
  size: BadgeSize;
  shape: BadgeShape;
}

/** The names before `intent` × `emphasis`. Kept until the app migrates; each keeps its old pill and height. */
const VARIANTS = {
  default: { intent: 'neutral', emphasis: 'outline', size: 'md', shape: 'pill' },
  secondary: { intent: 'neutral', emphasis: 'subtle', size: 'md', shape: 'pill' },
  outline: { intent: 'neutral', emphasis: 'outline', size: 'md', shape: 'pill' },
  /** @deprecated Renders as `outline`; use `intent='success'` for a positive state. */
  green: { intent: 'neutral', emphasis: 'outline', size: 'md', shape: 'pill' },
  destructive: { intent: 'destructive', emphasis: 'outline', size: 'md', shape: 'pill' },
  ghost: { intent: 'neutral', emphasis: 'ghost', size: 'md', shape: 'pill' },
  muted: { intent: 'neutral', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  success: { intent: 'success', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  warning: { intent: 'warning', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  info: { intent: 'info', emphasis: 'subtle', size: 'sm', shape: 'pill' },
  danger: { intent: 'destructive', emphasis: 'subtle', size: 'sm', shape: 'pill' },
} as const satisfies Record<string, BadgeStyle>;

type BadgeVariant = keyof typeof VARIANTS;

interface BadgeStyleProps {
  /** @deprecated Use `intent`, `emphasis`, `size` and `shape`. */
  variant?: BadgeVariant | null;
  intent?: Intent | null;
  emphasis?: BadgeEmphasis | null;
  size?: BadgeSize | null;
  shape?: BadgeShape | null;
}

const NEW_DEFAULT: BadgeStyle = { intent: 'neutral', emphasis: 'subtle', size: 'md', shape: 'rounded' };

function badgeVariants({ variant, intent, emphasis, size, shape }: BadgeStyleProps = {}): string {
  const base: BadgeStyle = variant ? VARIANTS[variant] : NEW_DEFAULT;
  return cn(
    intentVariants({ intent: intent ?? base.intent, emphasis: emphasis ?? base.emphasis }),
    badgeShape({ size: size ?? base.size, shape: shape ?? base.shape }),
    // The old neutral pills: regular weight, muted ghost text.
    variant === 'ghost' && 'font-normal text-muted-foreground',
    (variant === 'default' || variant === 'outline' || variant === 'green' || variant === 'secondary') && 'font-normal',
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, BadgeStyleProps {}

function Badge({ className, variant, intent, emphasis, size, shape, ...props }: BadgeProps) {
  return (
    <div
      data-slot='badge'
      className={cn(badgeVariants({ variant, intent, emphasis, size, shape }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants, type BadgeVariant };
