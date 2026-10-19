import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

/**
 * The spacing steps (DESIGN.md, Spacing) as gap classes. Layout primitives take a step name, never a number, so a
 * tuned step moves every gap. `none` is for a stack whose children carry their own spacing.
 */
const gapVariants = {
  none: 'gap-0',
  tight: 'gap-tight',
  related: 'gap-related',
  group: 'gap-group',
  page: 'gap-page',
  section: 'gap-section',
} as const;

type Space = keyof typeof gapVariants;

const stackVariants = cva('flex min-w-0 flex-col', {
  variants: {
    gap: gapVariants,
    align: {
      stretch: 'items-stretch',
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
  },
  defaultVariants: { gap: 'group', align: 'stretch' },
});

type StackProps = useRender.ComponentProps<'div'> & VariantProps<typeof stackVariants>;

/** Children top to bottom, one step apart. Default `group`: peer blocks, or a heading and its content. */
function Stack({ className, gap, align, render, ...props }: StackProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>({ className: cn(stackVariants({ gap, align }), className) }, props),
    render,
    state: { slot: 'stack' },
  });
}

const inlineVariants = cva('flex min-w-0', {
  variants: {
    gap: gapVariants,
    align: {
      center: 'items-center',
      start: 'items-start',
      end: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
    /** Below the breakpoint the row becomes a full-width stack, first child on top (action rows, toolbars). */
    collapseBelow: {
      none: '',
      sm: 'max-sm:flex-col max-sm:items-stretch',
      md: 'max-md:flex-col max-md:items-stretch',
    },
  },
  defaultVariants: { gap: 'related', align: 'center', justify: 'start', wrap: false, collapseBelow: 'none' },
});

type InlineProps = useRender.ComponentProps<'div'> & VariantProps<typeof inlineVariants>;

/**
 * Children left to right, vertically centered, one step apart. Default `related`: items that work together (buttons
 * in a row, a badge next to a title). For an icon and its label inside one control, use the control.
 */
function Inline({ className, gap, align, justify, wrap, collapseBelow, render, ...props }: InlineProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      { className: cn(inlineVariants({ gap, align, justify, wrap, collapseBelow }), className) },
      props,
    ),
    render,
    state: { slot: 'inline' },
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
    align: {
      stretch: 'items-stretch',
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: { gap: 'group', columns: 2, align: 'stretch' },
});

type ColumnsProps = useRender.ComponentProps<'div'> & VariantProps<typeof columnsVariants>;

/** Equal columns that fall back to one column on small screens. Default `group` between cells, both axes. */
function Columns({ className, gap, columns, align, render, ...props }: ColumnsProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>({ className: cn(columnsVariants({ gap, columns, align }), className) }, props),
    render,
    state: { slot: 'columns' },
  });
}

export { Columns, Inline, Stack, gapVariants, type ColumnsProps, type InlineProps, type Space, type StackProps };
