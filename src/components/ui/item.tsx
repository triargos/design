import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import * as React from 'react';
import useMeasure from 'react-use-measure';

import { Spinner } from '~/components/ui/spinner';

import { cn } from '~/lib/utils';

/**
 * A row of an `ItemList`: a list item around one `Item`. The row padding is `group`, and the hairline below it stops
 * there, so it lines up with the row content instead of running into the card's rounded edge.
 */
function ItemListRow({ last, ...props }: React.ComponentProps<'div'> & { last: boolean }) {
  return (
    <div
      role='listitem'
      data-slot='item-list-row'
      className={cn(
        '*:data-[slot=item]:px-group',
        !last &&
          'relative after:absolute after:right-group after:bottom-0 after:left-group after:h-px after:bg-border-subtle',
      )}
      {...props}
    />
  );
}

/** The list's own element; `aria-label` and `aria-labelledby` name the list inside it. */
type ItemListElementProps = Omit<
  React.ComponentProps<'div'>,
  'children' | 'role' | 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

type ItemListProps<T> = ItemListElementProps &
  (
    | {
        readonly virtualized?: false;
        /** The `Item`s. */
        readonly children?: React.ReactNode;
      }
    | {
        /**
         * Only the rows in view render, measured as they mount. The list scrolls itself: give it a height (`h-80`, or
         * `min-h-0 flex-1` in a full-height column).
         */
        readonly virtualized: true;
        readonly items: ReadonlyArray<T>;
        readonly itemKey: (item: T) => string;
        /** A row: one `Item`. */
        readonly children: (item: T, index: number) => React.ReactNode;
        /** A row's height before it is measured. */
        readonly estimatedItemSize?: number;
        /** More items exist: near the end of the list, `onLoadMore` asks for them. */
        readonly hasMore?: boolean;
        /** Shows a spinner after the last row. */
        readonly isLoadingMore?: boolean;
        readonly onLoadMore?: () => void;
        /** Announced while more rows load. */
        readonly loadingLabel?: string;
      }
  );

/**
 * Rows that run to the card's edge, hairlines between them: put it in `CardContent className='overflow-hidden'`. It
 * springs its height when rows come and go; `virtualized` for a long list.
 */
function ItemList<T>(props: ItemListProps<T>) {
  if (props.virtualized) return <VirtualizedItemList {...props} />;
  const { virtualized: _, ...rest } = props;
  return <StaticItemList {...rest} />;
}

function StaticItemList({
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ItemListElementProps & { children?: React.ReactNode }) {
  const [measureRef, bounds] = useMeasure();
  const rows = React.Children.toArray(children);
  return (
    <motion.div
      data-slot='item-list'
      className={cn('overflow-hidden', className)}
      initial={false}
      animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
      transition={{ type: 'spring', stiffness: 800, damping: 55, mass: 0.4 }}
      {...props}>
      <div ref={measureRef} role='list' aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
        {rows.map((row, index) => (
          <ItemListRow key={React.isValidElement(row) ? row.key : index} last={index === rows.length - 1}>
            {row}
          </ItemListRow>
        ))}
      </div>
    </motion.div>
  );
}

function VirtualizedItemList<T>({
  className,
  items,
  itemKey,
  children,
  estimatedItemSize = 72,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadingLabel = 'Loading more',
  virtualized: _,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: Extract<ItemListProps<T>, { virtualized: true }>) {
  const [scrollElement, setScrollElement] = React.useState<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimatedItemSize,
    getItemKey: (index) => itemKey(items[index]!),
    overscan: 5,
  });
  const rows = virtualizer.getVirtualItems();

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [nearEnd, setNearEnd] = React.useState(false);
  // Re-observe when `hasMore` mounts the sentinel and after each page, so a sentinel still in view reports again.
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !scrollElement) {
      setNearEnd(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setNearEnd(entry!.isIntersecting), {
      root: scrollElement,
      rootMargin: '500px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollElement, items.length, hasMore]);
  React.useEffect(() => {
    if (nearEnd && hasMore && !isLoadingMore) onLoadMore?.();
  }, [nearEnd, hasMore, isLoadingMore, onLoadMore]);

  return (
    <div
      ref={setScrollElement}
      data-slot='item-list'
      className={cn('overflow-y-auto overscroll-contain', className)}
      {...props}>
      <div
        role='list'
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className='relative w-full'
        style={{ height: virtualizer.getTotalSize() }}>
        {/* The rows in view flow in one block, moved down to the first one. */}
        <div className='absolute top-0 left-0 w-full' style={{ transform: `translateY(${rows[0]?.start ?? 0}px)` }}>
          {rows.map((row) => (
            <ItemListRow
              key={row.key}
              ref={virtualizer.measureElement}
              data-index={row.index}
              aria-setsize={items.length}
              aria-posinset={row.index + 1}
              last={row.index === items.length - 1}>
              {children(items[row.index]!, row.index)}
            </ItemListRow>
          ))}
        </div>
      </div>
      {hasMore && <div ref={sentinelRef} className='h-px' />}
      {isLoadingMore && (
        <div role='status' className='flex justify-center py-4'>
          <Spinner className='text-muted-foreground' size={20} />
          <span className='sr-only'>{loadingLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * A row: media, content, actions. In an `ItemList` it loses its own corners and edge. A link row fills with `row-hover`
 * under the pointer; a `selected` row fills with `muted`.
 */
function Item({
  className,
  render,
  selected = false,
  ...props
}: useRender.ComponentProps<'div'> & { selected?: boolean }) {
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'item', selected },
    props: mergeProps<'div'>(
      {
        className: cn(
          'group/item flex w-full flex-wrap items-center gap-2.5 rounded-control-lg border border-transparent px-3 py-2.5 text-body transition-colors duration-feedback outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24 in-data-[slot=item-list]:rounded-none in-data-[slot=item-list]:border-none data-selected:bg-muted [a]:no-underline [a]:hover:bg-row-hover',
          className,
        ),
      },
      props,
    ),
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

/** A full-width line above the row's media and content (the row wraps). */
function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-header'
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  );
}

/** A full-width line below the row's media and content. */
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
