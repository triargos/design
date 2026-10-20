import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

/** The spacing steps (DESIGN.md, Spacing) as gap classes: a layout takes a step name, never a number. */
const gapVariants = {
  tight: 'gap-tight',
  related: 'gap-related',
  group: 'gap-group',
  page: 'gap-page',
  section: 'gap-section',
} as const;

const stackVariants = cva('flex min-w-0 flex-col', {
  variants: {
    gap: gapVariants,
    align: {
      stretch: 'items-stretch',
      start: 'items-start',
    },
  },
  defaultVariants: { gap: 'group', align: 'stretch' },
});

/** Children top to bottom, one step apart. Default `group`: peer blocks, or a heading and its content. */
function Stack({
  className,
  gap,
  align,
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof stackVariants>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>({ className: cn(stackVariants({ gap, align }), className) }, props),
    render,
  });
}

const inlineVariants = cva('flex min-w-0 items-center', {
  variants: {
    gap: gapVariants,
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: { gap: 'related', wrap: false },
});

/** Children left to right, vertically centered, one step apart. Default `related`: items that work together. */
function Inline({
  className,
  gap,
  wrap,
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof inlineVariants>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>({ className: cn(inlineVariants({ gap, wrap }), className) }, props),
    render,
  });
}

const columnsVariants = cva('grid min-w-0 grid-cols-1', {
  variants: {
    gap: gapVariants,
    /** Columns from the breakpoint up; one column below it. */
    columns: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'sm:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: { gap: 'group', columns: 2 },
});

/** Equal columns that fall back to one column on small screens. Default `group` between cells, both axes. */
function Columns({
  className,
  gap,
  columns,
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof columnsVariants>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>({ className: cn(columnsVariants({ gap, columns }), className) }, props),
    render,
  });
}

export { Columns, Inline, Stack };
