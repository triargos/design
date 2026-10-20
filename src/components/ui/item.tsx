import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import * as React from 'react';
import useMeasure from 'react-use-measure';

import { cn } from '~/lib/utils';

// The hairline stops at the row padding (`group`), so it lines up with the row content instead of running into the
// card's rounded edge. Row padding targets direct item children, so it belongs on whichever element holds the rows: the
// list itself, or the inner measure wrapper when animated.
const itemListRowClasses = cn(
  '[&>[data-slot=item]]:px-group',
  '[&>[data-slot=item]:not(:last-child)]:relative',
  '[&>[data-slot=item]:not(:last-child)]:after:absolute [&>[data-slot=item]:not(:last-child)]:after:bottom-0',
  '[&>[data-slot=item]:not(:last-child)]:after:h-px [&>[data-slot=item]:not(:last-child)]:after:bg-border-subtle',
  '[&>[data-slot=item]:not(:last-child)]:after:right-group [&>[data-slot=item]:not(:last-child)]:after:left-group',
);

interface ItemListProps {
  className?: string;
  animate?: boolean;
  children?: React.ReactNode;
}

/**
 * Rows that run to the card's edge, hairlines between them: put it in `InsetCardContent className='overflow-hidden'`.
 * `animate` springs the height when rows come and go.
 */
function ItemList({ className, animate = true, children }: ItemListProps) {
  const [measureRef, bounds] = useMeasure();

  if (!animate) {
    return (
      <div role='list' data-slot='item-list' className={cn('overflow-hidden', itemListRowClasses, className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      role='list'
      data-slot='item-list'
      className={cn('overflow-hidden', className)}
      initial={false}
      animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
      transition={{
        type: 'spring',
        stiffness: 800,
        damping: 55,
        mass: 0.4,
      }}>
      <div ref={measureRef} className={itemListRowClasses}>
        {children}
      </div>
    </motion.div>
  );
}

const itemClassName =
  'group/item flex w-full flex-wrap items-center gap-2.5 rounded-control-lg border border-transparent px-3 py-2.5 text-body transition-colors duration-feedback outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24 in-data-[slot=item-list]:rounded-none in-data-[slot=item-list]:border-none data-[selected]:bg-muted data-[targeted]:bg-muted/40 [a]:no-underline [a]:hover:bg-row-hover';

/**
 * A row: media, content, actions. In an `ItemList` it loses its own corners and edge. A link row fills with `row-hover`
 * under the pointer; a selected row (`data-selected`) fills with `muted`.
 */
function Item({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'item' },
    props: mergeProps<'div'>({ className: cn(itemClassName, className) }, props),
  });
}

// Beside a title and description: `default` media up to 17px (an icon, a checkbox, a dot) stays on the title's line,
// taller media start 2px down; `icon` is a quiet square tile, centred, 32px beside a title alone and 40px beside both
// (a field-height tile, a little shorter than the two lines).
const itemMediaVariants = cva('flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none', {
  variants: {
    variant: {
      default:
        'group-has-data-[slot=item-description]/item:min-h-lh group-has-data-[slot=item-description]/item:self-start group-has-data-[slot=item-description]/item:py-0.5',
      icon: "size-8 rounded-control-lg bg-muted text-muted-foreground group-has-data-[slot=item-description]/item:size-10 [&_svg:not([class*='size-'])]:size-4",
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot='item-media'
      data-variant={variant}
      className={cn(itemMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-content'
      className={cn('flex flex-1 flex-col gap-tight [&+[data-slot=item-content]]:flex-none', className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-title'
      className={cn('line-clamp-1 flex w-fit items-center gap-2 text-body font-medium underline-offset-4', className)}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='item-description'
      className={cn(
        'line-clamp-2 text-left text-body font-normal text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='item-actions' className={cn('flex items-center gap-related', className)} {...props} />;
}

/** A full-width line above or below the row's media and content (the row wraps). */
const itemEdgeRow = 'flex basis-full items-center justify-between gap-2';

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='item-header' className={cn(itemEdgeRow, className)} {...props} />;
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='item-footer' className={cn(itemEdgeRow, className)} {...props} />;
}

export { Item, ItemList, ItemMedia, ItemContent, ItemActions, ItemTitle, ItemDescription, ItemHeader, ItemFooter };
