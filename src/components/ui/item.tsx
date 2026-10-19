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

/**
 * A row: media, content, actions. In an `ItemList` it loses its own corners and edge. A link row fills with `row-hover`
 * under the pointer; a selected row (`data-selected`) fills with `muted`.
 */
const itemClassName =
  'group/item flex w-full flex-wrap items-center rounded-control-lg border border-transparent text-body transition-colors duration-feedback outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24 in-data-[slot=item-list]:rounded-none in-data-[slot=item-list]:border-none data-[selected]:bg-muted data-[targeted]:bg-muted/40 [a]:no-underline [a]:transition-colors [a]:hover:bg-row-hover gap-2.5 px-3 py-2.5';

function Item({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(itemClassName, className),
      },
      props,
    ),
    render,
    state: { slot: 'item' },
  });
}

// `default` media up to 17px (an icon, a checkbox, a dot) is centred on the title's line; taller media start 2px down.
// `image` sits at the title's top. `icon` is a quiet square tile, centred: 32px beside a title alone, 40px beside a
// title and description (a field-height tile, a little shorter than the two lines).
const itemMediaOnTitleLine = cn(
  'group-has-data-[slot=item-description]/item:self-start',
  'group-has-data-[slot=item-description]/item:min-h-lh group-has-data-[slot=item-description]/item:py-0.5',
);
const itemMediaTopAligned =
  'group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start';

const itemMediaVariants = cva('flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none', {
  variants: {
    variant: {
      default: cn('bg-transparent', itemMediaOnTitleLine),
      icon: "size-8 rounded-control-lg bg-muted text-muted-foreground group-has-data-[slot=item-description]/item:size-10 [&_svg:not([class*='size-'])]:size-4",
      image: cn(
        'size-10 overflow-hidden rounded-control-sm [&_img]:size-full [&_img]:object-cover',
        itemMediaTopAligned,
      ),
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
      className={cn(itemMediaVariants({ variant, className }))}
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

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-header'
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-footer'
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  );
}

export { Item, ItemList, ItemMedia, ItemContent, ItemActions, ItemTitle, ItemDescription, ItemHeader, ItemFooter };
