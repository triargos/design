import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconChevronRight } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type Transition, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import useMeasure from 'react-use-measure';

import { Skeleton } from '~/components/ui/skeleton';
import { Spinner } from '~/components/ui/spinner';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

/**
 * A row of an `ItemList`: a list item around one `Item`. The row padding is `card`, and the hairline below it stops
 * there, so it lines up with the row content instead of running into the card's rounded edge.
 */
function ItemListRow({ last, ...props }: React.ComponentProps<'div'> & { last: boolean }) {
  return (
    <div
      role='listitem'
      data-slot='item-list-row'
      className={cn(
        '*:data-[slot=item]:px-card',
        !last &&
          'relative after:absolute after:right-card after:bottom-0 after:left-card after:h-px after:bg-border-subtle',
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
 * springs its height when rows come and go (reduced motion: it jumps); `virtualized` for a long list. While the rows
 * load, `ItemListSkeleton` stands in for it.
 */
function ItemList<T>(props: ItemListProps<T>) {
  if (props.virtualized) return <VirtualizedItemList {...props} />;
  const { virtualized: _, ...rest } = props;
  return <StaticItemList {...rest} />;
}

/** Firm and quick, no visible overshoot: a row arriving or leaving pushes the card edge. */
const heightSpring: Transition = { type: 'spring', stiffness: 800, damping: 55, mass: 0.4 };

function StaticItemList({
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ItemListElementProps & { children?: React.ReactNode }) {
  const [measureRef, bounds] = useMeasure();
  const reduced = useReducedMotion() ?? false;
  const rows = React.Children.toArray(children);
  return (
    <motion.div
      data-slot='item-list'
      className={cn('overflow-hidden', className)}
      initial={false}
      animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
      transition={reduced ? { duration: 0 } : heightSpring}
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
  loadingLabel,
  virtualized: _,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: Extract<ItemListProps<T>, { virtualized: true }>) {
  const { labels } = useLocale();
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
          <span className='sr-only'>{loadingLabel ?? labels.loadingMore}</span>
        </div>
      )}
    </div>
  );
}

const SKELETON_TITLE_WIDTHS = ['w-40', 'w-32', 'w-48'];
const SKELETON_DESCRIPTION_WIDTHS = ['w-64', 'w-56', 'w-72'];

type ItemListSkeletonProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** How many rows. */
  readonly rows?: number;
  /** The media the real rows carry: an `ItemMedia variant='icon'` tile, or a 40px `Avatar`. None by default. */
  readonly media?: 'icon' | 'avatar';
  /** A description line under each title (default), or the title alone. */
  readonly description?: boolean;
};

/**
 * The rows of an `ItemList` while they load, in its place. It is the real `Item` structure (row padding, media, title
 * and description at their line height), so the card keeps its height when the data arrives. Hidden from assistive
 * tech; title widths vary per row.
 */
function ItemListSkeleton({ rows = 3, media, description = true, className, ...props }: ItemListSkeletonProps) {
  return (
    <div data-slot='item-list' aria-hidden className={cn('overflow-hidden', className)} {...props}>
      {Array.from({ length: rows }, (_, index) => (
        <ItemListRow key={index} role={undefined} last={index === rows - 1}>
          <Item className='flex-nowrap'>
            {media === 'icon' && (
              <ItemMedia variant='icon' className='bg-transparent'>
                <Skeleton className='size-full rounded-[inherit]' />
              </ItemMedia>
            )}
            {media === 'avatar' && (
              <ItemMedia>
                <Skeleton className='size-10 rounded-full' />
              </ItemMedia>
            )}
            <ItemContent>
              <ItemTitle className='h-lh'>
                <Skeleton
                  className={cn('h-3.5 max-w-full', SKELETON_TITLE_WIDTHS[index % SKELETON_TITLE_WIDTHS.length])}
                />
              </ItemTitle>
              {description && (
                // Not an `ItemDescription`: a `p` cannot hold the skeleton's `div`. The slot keeps the media aligned.
                <div data-slot='item-description' className='flex h-lh items-center'>
                  <Skeleton
                    className={cn(
                      'h-3 max-w-full',
                      SKELETON_DESCRIPTION_WIDTHS[index % SKELETON_DESCRIPTION_WIDTHS.length],
                    )}
                  />
                </div>
              )}
            </ItemContent>
          </Item>
        </ItemListRow>
      ))}
    </div>
  );
}

/**
 * A row: media, content, actions. In an `ItemList` it loses its own corners and edge. A link row fills with `row-hover`
 * under the pointer and ends in an `ItemChevron`; a `selected` row fills with `muted`.
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
      className={cn('flex min-w-0 flex-1 flex-col gap-tight [&+[data-slot=item-content]]:flex-none', className)}
      {...props}
    />
  );
}

/**
 * One line. Plain text truncates with an ellipsis. With an element beside the text (a badge, an icon, a dot) the title
 * is a flex row: wrap the text in a plain `span`, which truncates while the others keep their size (a bare text node
 * cannot shrink in a flex row).
 */
function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-title'
      className={cn(
        'block w-fit max-w-full min-w-0 truncate text-body font-medium underline-offset-4',
        'has-[>*]:flex has-[>*]:items-center has-[>*]:gap-2 has-[>*]:*:shrink-0 has-[>*]:[&>span:not([data-slot])]:shrink has-[>*]:[&>span:not([data-slot])]:truncate',
        className,
      )}
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

/** The trailing arrow of a link row: it nudges right while the row is hovered or focused (reduced motion: it stays). */
function ItemChevron({ className, ...props }: React.ComponentProps<typeof IconChevronRight>) {
  return (
    <IconChevronRight
      data-slot='item-chevron'
      aria-hidden
      className={cn(
        'size-4 shrink-0 text-faint-foreground transition-[color,translate] duration-feedback',
        'group-hover/item:text-muted-foreground group-focus-visible/item:text-muted-foreground',
        'motion-safe:group-hover/item:translate-x-0.5 motion-safe:group-focus-visible/item:translate-x-0.5',
        className,
      )}
      {...props}
    />
  );
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

export {
  Item,
  ItemList,
  ItemListSkeleton,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemChevron,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
