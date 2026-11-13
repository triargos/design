import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconChevronRight } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Skeleton } from '~/components/ui/skeleton';

import { useReducedMotion } from '~/hooks/use-reduced-motion';
import { LoadMore, useVirtualRows } from '~/hooks/use-virtual-rows';
import { springEasing } from '~/lib/animate';
import { cn } from '~/lib/utils';

/**
 * A row of an `ItemList`: a list item around one `Item`. It sets the row's padding as `--list-row-pad-*`, which its `Item`
 * and a `flush` `Accordion` in it read (`-y`: each side of a rule between rows; `-top`, `-bottom`: the row's own edges).
 * Outside a card every row pads `row-pad-x` (12) on every side, so whatever sits at an edge (an icon tile, an avatar, a
 * button, a chevron) is as far from the row's top and bottom as from its side.
 *
 * In a card one token sets them all, so the list sits in the card as content padded `p-card` does: the row runs to the
 * card's edge (its hover fills to it) and pads `card` at the sides, so its text starts on the header's; the first row
 * pads `card` above, the last `card` below; between rows each side of the hairline pads half of it, so rows sit `card`
 * apart too. The hairline stops at the row's inline padding, on the text edge, clear of the card's rounded edge.
 */
function ItemListRow({ first, last, ...props }: React.ComponentProps<'div'> & { first: boolean; last: boolean }) {
  return (
    <div
      role='listitem'
      data-slot='item-list-row'
      className={cn(
        '[--list-row-pad-bottom:var(--spacing-row-pad-x)] [--list-row-pad-top:var(--spacing-row-pad-x)] [--list-row-pad-x:var(--spacing-row-pad-x)] [--list-row-pad-y:var(--spacing-row-pad-x)]',
        'in-data-[slot=card-content]:[--list-row-pad-bottom:calc(var(--spacing-card)/2)] in-data-[slot=card-content]:[--list-row-pad-top:calc(var(--spacing-card)/2)] in-data-[slot=card-content]:[--list-row-pad-x:var(--spacing-card)] in-data-[slot=card-content]:[--list-row-pad-y:calc(var(--spacing-card)/2)]',
        first && 'in-data-[slot=card-content]:[--list-row-pad-top:var(--spacing-card)]',
        last && 'in-data-[slot=card-content]:[--list-row-pad-bottom:var(--spacing-card)]',
        '*:data-[slot=item]:px-(--list-row-pad-x) *:data-[slot=item]:pt-(--list-row-pad-top) *:data-[slot=item]:pb-(--list-row-pad-bottom)',
        !last &&
          'relative after:absolute after:right-(--list-row-pad-x) after:bottom-0 after:left-(--list-row-pad-x) after:h-px after:bg-border-subtle',
      )}
      {...props}
    />
  );
}

/** The list's own element; `aria-label` and `aria-labelledby` name the list inside it. */
type ItemListElementProps = Omit<React.ComponentProps<'div'>, 'children' | 'role'>;

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
        /**
         * The element that scrolls the rows, when it holds more than the list (the page's scroll panel, a dialog
         * body). `null` until it mounts. Unset, the list scrolls itself.
         */
        readonly scrollElement?: HTMLElement | null;
      }
  );

/**
 * Rows that run to the card's edge, hairlines between them: put it in `CardContent className='overflow-hidden'`, which
 * clips the rows' fills to the card's corners. It springs its height when rows come and go or change size (reduced
 * motion: it jumps); a row that animates its own height, as an `Accordion` panel does, sets the pace instead.
 * `virtualized` for a long list. While the rows load, `ItemListSkeleton` stands in for it.
 */
function ItemList<T>(props: ItemListProps<T>) {
  if (props.virtualized) return <VirtualizedItemList {...props} />;
  const { virtualized: _, ...rest } = props;
  return <StaticItemList {...rest} />;
}

function StaticItemList({
  className,
  children,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ItemListElementProps & { children?: React.ReactNode }) {
  const rowsRef = useListFold();
  const rows = React.Children.toArray(children);
  return (
    <div data-slot='item-list' className={cn('overflow-hidden', className)} style={style} {...props}>
      <div ref={rowsRef} role='list' aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
        {rows.map((row, index) => (
          <ItemListRow
            key={React.isValidElement(row) ? row.key : index}
            first={index === 0}
            last={index === rows.length - 1}>
            {row}
          </ItemListRow>
        ))}
      </div>
    </div>
  );
}

/** Height changes a running animation in the rows makes: they move the rows themselves, frame by frame. */
const foldsItself = (animation: Animation) =>
  animation instanceof CSSTransition
    ? animation.transitionProperty === 'height' || animation.transitionProperty === 'grid-template-rows'
    : animation.effect instanceof KeyframeEffect &&
      animation.effect.getKeyframes().some((keyframe) => 'height' in keyframe || 'gridTemplateRows' in keyframe);

/**
 * Springs the list from the height it shows to its rows' new height whenever they resize, and leaves it `auto`
 * otherwise, so it never clips a row. A resize from a row's own height animation passes through: a spring behind it
 * would trail the row and overshoot after it settled.
 */
function useListFold() {
  const rowsRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  React.useLayoutEffect(() => {
    const rows = rowsRef.current;
    const list = rows?.parentElement;
    if (!rows || !list) return;
    let height = rows.getBoundingClientRect().height;
    let fold: Animation | undefined;
    const observer = new ResizeObserver(() => {
      const next = rows.getBoundingClientRect().height;
      if (next === height) return;
      // Mid-spring the list stands between two heights: the next spring starts there.
      const from = fold?.playState === 'running' ? list.getBoundingClientRect().height : height;
      height = next;
      fold?.cancel();
      if (reduced || rows.getAnimations({ subtree: true }).some(foldsItself)) return;
      const duration = parseFloat(getComputedStyle(list).getPropertyValue('--transition-duration-fold')) || 400;
      // No fill: the finished spring hands the height back to `auto`.
      fold = list.animate({ height: [`${from}px`, `${next}px`] }, { duration, easing: springEasing() });
    });
    observer.observe(rows);
    return () => {
      observer.disconnect();
      fold?.cancel();
    };
  }, [reduced]);
  return rowsRef;
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
  scrollElement,
  virtualized: _,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: Extract<ItemListProps<T>, { virtualized: true }>) {
  const ownScroll = scrollElement === undefined;
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const scroller = ownScroll ? container : scrollElement;
  const [list, setList] = React.useState<HTMLDivElement | null>(null);
  const { virtualizer, scrollMargin, sentinelRef } = useVirtualRows({
    items,
    itemKey,
    estimatedItemSize,
    scroller,
    start: list,
    hasMore,
    isLoadingMore,
    onLoadMore,
  });
  const rows = virtualizer.getVirtualItems();

  return (
    <div
      ref={setContainer}
      data-slot='item-list'
      // Its own scroll box is a tab stop, so the keyboard can scroll a list whose rows hold nothing focusable.
      tabIndex={ownScroll ? 0 : undefined}
      className={cn(
        ownScroll &&
          'overflow-y-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:ring-inset',
        className,
      )}
      {...props}>
      <div
        ref={setList}
        role='list'
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className='relative w-full'
        style={{ height: virtualizer.getTotalSize() }}>
        {/* The rows in view flow in one block, moved down to the first one. */}
        <div
          className='absolute top-0 left-0 w-full'
          style={{ transform: `translateY(${(rows[0]?.start ?? 0) - scrollMargin}px)` }}>
          {rows.map((row) => (
            <ItemListRow
              key={row.key}
              ref={virtualizer.measureElement}
              data-index={row.index}
              aria-setsize={items.length}
              aria-posinset={row.index + 1}
              first={row.index === 0}
              last={row.index === items.length - 1}>
              {children(items[row.index]!, row.index)}
            </ItemListRow>
          ))}
        </div>
      </div>
      <LoadMore sentinelRef={sentinelRef} hasMore={hasMore} isLoadingMore={isLoadingMore} label={loadingLabel} />
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
        <ItemListRow key={index} role={undefined} first={index === 0} last={index === rows - 1}>
          <Item>
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
 *
 * Below `sm` a row with a description sets its actions on a line of their own, end-aligned: beside them the description
 * squeezes into its two-line clamp and hides what it says. The media and the text stay on the first line. Callers must
 * not set `flex-nowrap`: the actions still take the full line and push the text to zero width.
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
          'max-sm:has-[[data-slot=item-description]]:*:data-[slot=item-actions]:basis-full max-sm:has-[[data-slot=item-description]]:*:data-[slot=item-actions]:justify-end',
          'group/item flex w-full flex-wrap items-center gap-(--item-gap) rounded-block border border-transparent px-row-pad-x py-row-pad-y text-body transition-colors duration-feedback outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24 in-data-[slot=item-list]:rounded-none in-data-[slot=item-list]:border-none in-data-[slot=item-list]:focus-visible:ring-inset data-selected:bg-muted [a]:no-underline [a]:hover:bg-row-hover',
          className,
        ),
      },
      props,
    ),
  });
}

// Beside a title and description: `default` media up to 17px (an icon, a checkbox, a dot) stays on the title's line,
// taller media start 2px down; `icon` is a quiet square tile, centred, `control-sm` beside a title alone and
// `control-lg` beside both (a little shorter than the two lines).
const itemMediaVariants = cva('flex shrink-0 items-center justify-center gap-row-gap [&_svg]:pointer-events-none', {
  variants: {
    variant: {
      default:
        'group-has-data-[slot=item-description]/item:min-h-lh group-has-data-[slot=item-description]/item:self-start group-has-data-[slot=item-description]/item:py-0.5',
      icon: "size-control-sm rounded-control-lg bg-muted text-muted-foreground group-has-data-[slot=item-description]/item:size-control-lg [&_svg:not([class*='size-'])]:size-icon",
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
        'has-[>*]:flex has-[>*]:items-center has-[>*]:gap-row-gap has-[>*]:*:shrink-0 has-[>*]:[&>span:not([data-slot])]:shrink has-[>*]:[&>span:not([data-slot])]:truncate',
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
        'size-icon shrink-0 text-faint-foreground transition-[color,translate] duration-feedback',
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
      className={cn('flex basis-full items-center justify-between gap-related', className)}
      {...props}
    />
  );
}

/** A full-width line below the row's media and content. */
function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='item-footer'
      className={cn('flex basis-full items-center justify-between gap-related', className)}
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
