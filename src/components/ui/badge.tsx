import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva } from 'class-variance-authority';

import { dataColorStyle, type Emphasis, type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

/**
 * A label for a state or a count: an `intent` at `subtle` (the default), `solid` (needs action) or `outline` (quiet,
 * dense lists). 24px, or 20px at `size='sm'`; `shape='pill'` for a count or a filter chip. A link badge:
 * `render={<a href='…' />}`. A color from data (an organization's category or label color) is `color` instead of
 * `intent`: any CSS color or `var(--category-N)`; every emphasis paints from it.
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

type BadgeProps = Omit<useRender.ComponentProps<'span'>, 'color'> & {
  emphasis?: Extract<Emphasis, 'solid' | 'subtle' | 'outline'>;
  size?: 'default' | 'sm';
  shape?: 'rounded' | 'pill';
} & ({ intent?: Intent; color?: undefined } | { color: string; intent?: never });

function Badge({
  className,
  intent = 'neutral',
  color,
  emphasis = 'subtle',
  size = 'default',
  shape = 'rounded',
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    state: { slot: 'badge' },
    props: mergeProps<'span'>(
      {
        className: cn(
          intentVariants({ intent: color === undefined ? intent : 'data', emphasis }),
          badgeShape({ size, shape }),
          className,
        ),
        style: color === undefined ? undefined : dataColorStyle(color),
      },
      props,
    ),
  });
}

export { Badge };
