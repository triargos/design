import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconArrowsSort, IconArrowUp, IconChevronDown } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cva } from 'class-variance-authority';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useLocale } from '~/components/ui/locale';
import { Spinner } from '~/components/ui/spinner';

import { cn } from '~/lib/utils';

// Markup for a TanStack Table (`useTable`, `table.FlexRender`) or a static table. Three variants:
// - `default`: a plain table; rows separated by hairlines.
// - `flush`: `default` filling a card edge to edge, as an `ItemList` does:
//   `<CardContent className='overflow-hidden'><Table variant='flush'>`. The first and last column sit `card` in,
//   on the card header's text.
// - `card`: the table is the content of an `Card`, in place of `CardContent`. Header and footer rows sit on
//   the shell; the body is the card (`bg-card`, an `--edge` ring, `rounded-inner` corners). Put it straight in the
//   shell: `<Card><Table variant='card'>…</Table></Card>`.
// Beyond the markup:
// - a sortable column: `TableHead sort onSort` (a button inside the header cell, `aria-sort` on the cell).
// - groups: `TableGroupRow`, a rounded band inset in its row over every column; with `onOpenChange` it folds its rows.
// - a row that opens a page: `TableRowLink` in one cell; its click area covers the row (a `tr` cannot be a link).
// - a long table: `Table virtualized items itemKey`, as `ItemList virtualized`: the rows in view render between two
//   spacer rows, the header sticks, the columns are `table-fixed`.

type TableVariant = 'default' | 'flush' | 'card';
type TableSection = 'head' | 'body' | 'foot';

const TableVariantContext = createContext<TableVariant>('default');
const TableSectionContext = createContext<TableSection>('body');
/** Set inside a virtualized table: the header sticks, the head row is ARIA row 1. */
const TableVirtualizedContext = createContext(false);

/** The row of a virtualized table being rendered: `TableRow` takes its measuring ref and ARIA row from here. */
interface TableVirtualRow {
  readonly index: number;
  readonly rowIndex: number;
  readonly measure: (element: HTMLTableRowElement | null) => void;
}

const TableVirtualRowContext = createContext<TableVirtualRow | null>(null);

/** The table's own element; `aria-label` and `aria-labelledby` name the table inside it. */
type TableContainerProps = Omit<ComponentProps<'div'>, 'children' | 'role'>;

type TableProps<T> =
  | (ComponentProps<'table'> & {
      readonly variant?: TableVariant;
      readonly virtualized?: false;
    })
  | (TableContainerProps & {
      readonly variant?: TableVariant;
      /**
       * Only the rows in view render, measured as they mount. `className` sizes the scroll box, as on `ItemList`: give
       * it a height (`h-96`, or `min-h-0 flex-1` in a full-height column). Give the head cells their widths; the table
       * is `table-fixed`, so columns stay still while rows come and go.
       */
      readonly virtualized: true;
      readonly items: ReadonlyArray<T>;
      readonly itemKey: (item: T) => string;
      /** A row: one `TableRow` or `TableGroupRow`, or a component that renders one. */
      readonly children: (item: T, index: number) => ReactNode;
      /** The `TableHeader`, one row; it sticks to the top of the scroll box. */
      readonly header?: ReactNode;
      /** A row's height before it is measured. */
      readonly estimatedItemSize?: number;
      /** More items exist: near the end of the table, `onLoadMore` asks for them. */
      readonly hasMore?: boolean;
      /** Shows a spinner after the last row. */
      readonly isLoadingMore?: boolean;
      readonly onLoadMore?: () => void;
      /** Announced while more rows load. */
      readonly loadingLabel?: string;
      /**
       * The element that scrolls the rows, when it holds more than the table (the page's scroll panel, a dialog body).
       * The header sticks to its top, and the table does not scroll sideways: fit the columns to the width. `null`
       * until it mounts. Unset, the table scrolls itself.
       */
      readonly scrollElement?: HTMLElement | null;
      /** Rows in all, the header row included; unset, `items` + 1, or unknown (-1) while `hasMore`. */
      readonly 'aria-rowcount'?: number;
    });

function Table<T>(props: TableProps<T>) {
  if (props.virtualized) return <VirtualizedTable {...props} />;
  const { className, variant = 'default', virtualized: _, ...rest } = props;
  return (
    <TableVariantContext value={variant}>
      <div data-slot='table-container' data-variant={variant} className='relative w-full overflow-x-auto'>
        <table
          data-slot='table'
          className={cn(
            'w-full caption-bottom text-control',
            variant === 'card' && 'border-separate border-spacing-0',
            className,
          )}
          {...rest}
        />
      </div>
    </TableVariantContext>
  );
}

/** Distance from the top of the scroll content of `scrollElement` to the top of `element`. */
function useOffsetInScrollElement(scrollElement: HTMLElement | null, element: HTMLElement | null) {
  const [offset, setOffset] = useState(0);
  useLayoutEffect(() => {
    if (!scrollElement || !element) return;
    const measure = () =>
      setOffset(
        element.getBoundingClientRect().top -
          scrollElement.getBoundingClientRect().top -
          scrollElement.clientTop +
          scrollElement.scrollTop,
      );
    measure();
    // Content above the table (or the header) can change height after it loads.
    const observer = new ResizeObserver(measure);
    for (const child of scrollElement.children) observer.observe(child);
    return () => observer.disconnect();
  }, [scrollElement, element]);
  return offset;
}

function VirtualizedTable<T>({
  className,
  variant = 'default',
  items,
  itemKey,
  children,
  header,
  estimatedItemSize = 48,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadingLabel,
  scrollElement,
  virtualized: _,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-rowcount': ariaRowCount,
  ...props
}: Extract<TableProps<T>, { virtualized: true }>) {
  const { labels } = useLocale();
  const ownScroll = scrollElement === undefined;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const scroller = ownScroll ? container : scrollElement;
  const [body, setBody] = useState<HTMLTableSectionElement | null>(null);
  const scrollMargin = useOffsetInScrollElement(scroller, body);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scroller,
    estimateSize: () => estimatedItemSize,
    getItemKey: (index) => itemKey(items[index]!),
    overscan: 5,
    scrollMargin,
  });
  const rows = virtualizer.getVirtualItems();
  const first = rows[0];
  const last = rows[rows.length - 1];
  // A table row cannot move on its own: the rows in view flow between a spacer above and one below.
  const paddingTop = first === undefined ? 0 : first.start - scrollMargin;
  const paddingBottom = virtualizer.getTotalSize() - (last === undefined ? 0 : last.end - scrollMargin);
  const headerRows = header === undefined ? 0 : 1;

  // The spacers span every column: count them on the first row (a `colSpan` past the last column would add columns).
  const [columnCount, setColumnCount] = useState(1);
  useLayoutEffect(() => {
    const row = body?.closest('table')?.querySelector<HTMLTableRowElement>('tr:not([data-slot=table-spacer])');
    if (!row) return;
    const count = Array.from(row.cells).reduce((sum, cell) => sum + cell.colSpan, 0);
    if (count !== columnCount) setColumnCount(count);
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [nearEnd, setNearEnd] = useState(false);
  // Re-observe when `hasMore` mounts the sentinel and after each page, so a sentinel still in view reports again.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !scroller) {
      setNearEnd(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setNearEnd(entry!.isIntersecting), {
      root: scroller,
      rootMargin: '500px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scroller, items.length, hasMore]);
  useEffect(() => {
    if (nearEnd && hasMore && !isLoadingMore) onLoadMore?.();
  }, [nearEnd, hasMore, isLoadingMore, onLoadMore]);

  return (
    <TableVariantContext value={variant}>
      <TableVirtualizedContext value>
        <div
          ref={setContainer}
          data-slot='table-container'
          data-variant={variant}
          // A scroll box takes the keyboard: focusable, so arrow keys scroll it.
          tabIndex={ownScroll ? 0 : undefined}
          className={cn(
            'relative w-full',
            // `clip`, not `auto`: a scroll box here would catch the sticky header.
            ownScroll
              ? 'overflow-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:ring-inset'
              : 'overflow-x-clip',
            ownScroll && variant === 'card' && 'rounded-inner',
            className,
          )}
          {...props}>
          <table
            data-slot='table'
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-rowcount={ariaRowCount ?? (hasMore ? -1 : items.length + headerRows)}
            className={cn(
              'w-full table-fixed caption-bottom text-control',
              variant === 'card' && 'border-separate border-spacing-0',
            )}>
            {header}
            <TableBody ref={setBody}>
              {paddingTop > 0 && <TableSpacer edge='top' height={paddingTop} columnCount={columnCount} />}
              {rows.map((row) => (
                <TableVirtualRowProvider
                  key={row.key}
                  index={row.index}
                  rowIndex={row.index + 1 + headerRows}
                  measure={virtualizer.measureElement}>
                  {children(items[row.index]!, row.index)}
                </TableVirtualRowProvider>
              ))}
              {paddingBottom > 0 && <TableSpacer edge='bottom' height={paddingBottom} columnCount={columnCount} />}
            </TableBody>
          </table>
          {hasMore && <div ref={sentinelRef} className='h-px' />}
          {isLoadingMore && (
            <div role='status' className='flex justify-center py-4'>
              <Spinner className='text-muted-foreground' size={20} />
              <span className='sr-only'>{loadingLabel ?? labels.loadingMore}</span>
            </div>
          )}
        </div>
      </TableVirtualizedContext>
    </TableVariantContext>
  );
}

function TableVirtualRowProvider({ index, rowIndex, measure, children }: TableVirtualRow & { children: ReactNode }) {
  return <TableVirtualRowContext value={{ index, rowIndex, measure }}>{children}</TableVirtualRowContext>;
}

/**
 * Keeps the scroll height of the rows out of view. In a card it is the card: the fill and side edges, and the top or
 * bottom edge and corners of the rows it stands for.
 */
function TableSpacer({ edge, height, columnCount }: { edge: 'top' | 'bottom'; height: number; columnCount: number }) {
  const variant = use(TableVariantContext);
  return (
    <tr aria-hidden data-slot='table-spacer'>
      <td
        colSpan={columnCount}
        className={cn(
          'p-0',
          variant === 'card' && 'border-x border-(--edge) bg-card bg-clip-padding',
          variant === 'card' && edge === 'top' && 'rounded-t-inner border-t',
          variant === 'card' && edge === 'bottom' && 'rounded-b-inner border-b',
        )}
        style={{ height }}
      />
    </tr>
  );
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  const variant = use(TableVariantContext);
  const virtualized = use(TableVirtualizedContext);
  return (
    <TableSectionContext value='head'>
      <thead
        data-slot='table-header'
        // A sticky header draws its own line (`TableHead`): the row's border would scroll away.
        className={cn(variant !== 'card' && !virtualized && '[&_tr]:border-b [&_tr]:border-border', className)}
        {...props}
      />
    </TableSectionContext>
  );
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  const variant = use(TableVariantContext);
  return (
    <TableSectionContext value='body'>
      <tbody
        data-slot='table-body'
        // The card's quiet fills (`muted`, `border-subtle`) are one step from the card, not the shell.
        data-surface={variant === 'card' ? 'card' : undefined}
        className={cn(variant !== 'card' && '[&_tr:last-child]:border-0', className)}
        {...props}
      />
    </TableSectionContext>
  );
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  const variant = use(TableVariantContext);
  return (
    <TableSectionContext value='foot'>
      <tfoot
        data-slot='table-footer'
        className={cn(
          'font-medium',
          variant !== 'card' && 'border-t border-border bg-muted/50 [&>tr]:last:border-b-0',
          className,
        )}
        {...props}
      />
    </TableSectionContext>
  );
}

function setRef<E>(ref: Ref<E> | undefined, element: E | null) {
  if (typeof ref === 'function') ref(element);
  else if (ref) ref.current = element;
}

// Card rows separate collapsed borders, so row state paints on the cells (`tableCellVariants`). In a virtualized table
// a row takes its measuring ref and `aria-rowindex` from the row being rendered.
function TableRow({ className, selected = false, ref, ...props }: ComponentProps<'tr'> & { selected?: boolean }) {
  const variant = use(TableVariantContext);
  const section = use(TableSectionContext);
  const virtualized = use(TableVirtualizedContext);
  const virtualRow = use(TableVirtualRowContext);
  const measure = virtualRow?.measure;
  const rowRef = useCallback(
    (element: HTMLTableRowElement | null) => {
      measure?.(element);
      setRef(ref, element);
    },
    [measure, ref],
  );
  return (
    <tr
      ref={rowRef}
      data-slot='table-row'
      data-selected={selected || undefined}
      data-index={virtualRow?.index}
      aria-rowindex={virtualRow?.rowIndex ?? (virtualized && section === 'head' ? 1 : undefined)}
      className={cn(
        variant !== 'card' && 'border-b border-border-subtle transition-colors data-selected:bg-muted',
        // No hairline above a group band.
        variant !== 'card' && '[&:has(+tr[data-slot=table-group-row])]:border-b-transparent',
        variant !== 'card' && section === 'body' && 'hover:bg-row-hover',
        // A row link's click area covers the row; the row's other controls sit above it.
        'has-data-[slot=table-row-link]:relative',
        '[&:has([data-slot=table-row-link])_:is(a,button,input,select,textarea,label):not([data-slot=table-row-link])]:relative',
        '[&:has([data-slot=table-row-link])_:is(a,button,input,select,textarea,label):not([data-slot=table-row-link])]:z-10',
        className,
      )}
      {...props}
    />
  );
}

// Flush and card: the first and last cell line up with `CardHeader` text (`card` + the card's 1px edge in). Flush
// cells sit inside the edge already; card head and foot cells sit on the shell, so they add the 1px. A checkbox column
// shrinks to the box.
const tableCellEdges = cva(
  'has-[[role=checkbox]]:w-px first:has-[[role=checkbox]]:pe-0 last:has-[[role=checkbox]]:ps-0',
  {
    variants: {
      variant: {
        default: 'px-3',
        flush: 'px-3 first:ps-card last:pe-card',
        card: 'px-3 first:ps-[calc(var(--spacing-card)+1px)] last:pe-[calc(var(--spacing-card)+1px)]',
      },
    },
  },
);

type TableSort = 'asc' | 'desc' | 'none';

const ariaSortOf = { asc: 'ascending', desc: 'descending', none: 'none' } as const;

// A sticky head cell paints the surface it sits on, so rows scroll under it; above every row control (`z-10`).
const stickyHeadFill = {
  default: 'bg-background',
  flush: 'bg-card',
  card: 'bg-(--card-shell)',
} as const satisfies Record<TableVariant, string>;

function TableHead({
  className,
  children,
  sort,
  onSort,
  ...props
}: Omit<ComponentProps<'th'>, 'aria-sort'> & {
  /** The column's direction; with `onSort` the header is a button. `none`: sortable, not the sort column. */
  sort?: TableSort;
  /** The call site sorts the rows. */
  onSort?: () => void;
}) {
  const variant = use(TableVariantContext);
  const virtualized = use(TableVirtualizedContext);
  return (
    <th
      data-slot='table-head'
      aria-sort={sort === undefined || onSort === undefined ? undefined : ariaSortOf[sort]}
      className={cn(
        tableCellEdges({ variant }),
        'h-10 text-left align-middle font-medium whitespace-nowrap text-muted-foreground',
        virtualized && ['sticky top-0 z-20', stickyHeadFill[variant]],
        virtualized && variant !== 'card' && 'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border',
        className,
      )}
      {...props}>
      {onSort === undefined ? (
        children
      ) : (
        <button
          type='button'
          onClick={onSort}
          className={cn(
            'group/sort relative -mx-2 inline-flex items-center gap-1 rounded-control-sm px-2 py-1 font-medium transition-colors duration-feedback outline-none hit-area hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
            sort !== undefined && sort !== 'none' && 'text-foreground',
          )}>
          {children}
          {sort === undefined || sort === 'none' ? (
            <IconArrowsSort
              aria-hidden
              className='size-3.5 opacity-0 transition-opacity duration-feedback group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100'
            />
          ) : (
            // One arrow that turns, so flipping the direction reads as the same column turning over.
            <IconArrowUp
              aria-hidden
              className={cn(
                'size-3.5 transition-transform duration-move ease-move motion-reduce:transition-none',
                sort === 'desc' && 'rotate-180',
              )}
            />
          )}
        </button>
      )}
    </th>
  );
}

// Card body: the cells are the card, not the `tbody` (a `tbody` is no containing block in Safari, so a surface hung on
// it lands on the table). Each cell fills with `bg-card`; the outer cells carry the `--edge` ring as a border, and
// `bg-clip-padding` keeps the fill inside it, so the ring sits on the shell, as `CardContent` does. Separators are
// `border-subtle` (opaque, so the shell behind the clipped border does not show). The first and last cell pad `card`
// inside the edge, on the head and foot cells' `card` + 1px. WebKit antialiases each cell's fill at fractional column
// edges and the shell shows through as a seam; a 1px shadow in the fill color reaches under the next cell and closes it.
// The fill is one variable, so hover and selection move fill and patch together.
const tableCellVariants = cva('py-2.5 align-middle', {
  variants: {
    variant: { default: '', flush: '', card: '' },
    section: { head: '', body: '', foot: '' },
  },
  compoundVariants: [
    {
      variant: 'card',
      section: 'body',
      className: [
        'bg-(--table-cell-fill) bg-clip-padding transition-colors [--table-cell-fill:var(--card)]',
        'shadow-[2px_0_0_-1px_var(--table-cell-fill)] last:shadow-none',
        'in-[tr:hover]:[--table-cell-fill:color-mix(in_oklch,var(--muted)_50%,var(--card))]',
        'in-[tr[data-selected]]:[--table-cell-fill:var(--muted)]',
        'border-b border-b-border-subtle in-[tr:last-child]:border-b-(--edge)',
        // No hairline next to a group band: the band separates. The border takes the fill, so the shell does not show.
        'in-[tr:has(+tr[data-slot=table-group-row])]:border-b-(--table-cell-fill)',
        'in-[tr[data-slot=table-group-row]:not(:last-child)]:border-b-(--table-cell-fill)',
        'in-[tr:first-child]:border-t in-[tr:first-child]:border-t-(--edge)',
        'first:border-s first:border-s-(--edge) first:ps-card last:border-e last:border-e-(--edge) last:pe-card',
        'in-[tr:first-child]:first:rounded-ss-inner in-[tr:first-child]:last:rounded-se-inner',
        'in-[tr:last-child]:first:rounded-es-inner in-[tr:last-child]:last:rounded-ee-inner',
      ],
    },
    { variant: 'card', section: 'foot', className: 'py-3' },
  ],
});

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  const variant = use(TableVariantContext);
  const section = use(TableSectionContext);
  return (
    <td
      data-slot='table-cell'
      className={cn(tableCellEdges({ variant }), tableCellVariants({ variant, section }), className)}
      {...props}
    />
  );
}

// The band sits in from the sides of its cell (8px in a plain table, 12px on a card) and 4px from the rows; the first
// band as far from the top edge as from the sides. Its text pads the cell edge less that inset: on the column text.
const groupCellInset = {
  default: 'px-2 first:ps-2 last:pe-2 in-[tr:first-child]:pt-2',
  flush: 'px-3 first:ps-3 last:pe-3 in-[tr:first-child]:pt-3',
  card: 'px-3 first:ps-3 last:pe-3 in-[tr:first-child]:pt-3',
} as const satisfies Record<TableVariant, string>;

const groupBandEdge = {
  default: 'px-1',
  flush: 'px-[calc(var(--spacing-card)-(--spacing(3)))]',
  card: 'px-[calc(var(--spacing-card)-(--spacing(3)))]',
} as const satisfies Record<TableVariant, string>;

const groupBand = 'flex min-h-11 items-center gap-2 rounded-control bg-muted font-medium text-foreground';

/**
 * A rounded band over every column that names the rows after it, inset in its row; no hairline above or below it.
 * Static, or with `onOpenChange` a fold button (`aria-expanded`, a chevron at the end); the call site leaves out the
 * rows of a closed group. Children: an optional leading icon, the name, a count (`Badge size='sm' shape='pill'`).
 */
function TableGroupRow({
  colSpan,
  open = true,
  onOpenChange,
  className,
  children,
  ...props
}: Omit<ComponentProps<'tr'>, 'children'> & {
  /** Columns of the table: the band spans them all. */
  colSpan: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const variant = use(TableVariantContext);
  return (
    <TableRow
      data-slot='table-group-row'
      className={cn(variant !== 'card' && 'border-b-transparent hover:bg-transparent', className)}
      {...props}>
      <TableCell
        colSpan={colSpan}
        className={cn('py-1 in-[tr:hover]:[--table-cell-fill:var(--card)]', groupCellInset[variant])}>
        {onOpenChange === undefined ? (
          <div className={cn(groupBand, groupBandEdge[variant])}>{children}</div>
        ) : (
          <button
            type='button'
            aria-expanded={open}
            onClick={() => onOpenChange(!open)}
            className={cn(
              groupBand,
              groupBandEdge[variant],
              'group/fold w-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/24',
            )}>
            {children}
            <IconChevronDown
              aria-hidden
              className={cn(
                'ms-auto size-4 shrink-0 text-muted-foreground transition-[rotate,color] duration-move ease-move group-hover/fold:text-foreground motion-reduce:transition-none',
                !open && '-rotate-90',
              )}
            />
          </button>
        )}
      </TableCell>
    </TableRow>
  );
}

/**
 * The link of a row that opens a page, in one cell (`render={<a href … />}` or a router link). A `tr` cannot be a
 * link, so the click area is the link's `::after`, stretched over the row; the keyboard ring draws on it. The row's
 * other controls (buttons, checkboxes, links) sit above it.
 */
function TableRowLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    state: { slot: 'table-row-link' },
    props: mergeProps<'a'>(
      {
        className: cn(
          'text-foreground no-underline outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/24 focus-visible:after:ring-inset',
          className,
        ),
      },
      props,
    ),
  });
}

export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableRowLink,
  type TableSort,
  type TableVariant,
};
