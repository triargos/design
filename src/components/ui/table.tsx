import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconArrowsSort, IconArrowUp, IconChevronDown } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';

import { LoadMore, useVirtualRows } from '~/hooks/use-virtual-rows';
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
// - groups: `TableGroupRow`, a flat `muted` band across every column; with `onOpenChange` it folds its rows.
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
  const ownScroll = scrollElement === undefined;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const scroller = ownScroll ? container : scrollElement;
  const [body, setBody] = useState<HTMLTableSectionElement | null>(null);
  const { virtualizer, scrollMargin, sentinelRef } = useVirtualRows({
    items,
    itemKey,
    estimatedItemSize,
    scroller,
    start: body,
    hasMore,
    isLoadingMore,
    onLoadMore,
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
          <LoadMore sentinelRef={sentinelRef} hasMore={hasMore} isLoadingMore={isLoadingMore} label={loadingLabel} />
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
        default: 'px-row-pad-x',
        flush: 'px-row-pad-x first:ps-card last:pe-card',
        card: 'px-row-pad-x first:ps-[calc(var(--spacing-card)+1px)] last:pe-[calc(var(--spacing-card)+1px)]',
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
        'h-(--table-head-height) text-left align-middle font-medium whitespace-nowrap text-muted-foreground',
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
            'group/sort relative -mx-(--table-sort-pad-x) inline-flex items-center gap-control-gap-sm rounded-control-sm px-(--table-sort-pad-x) py-(--table-sort-pad-y) font-medium transition-colors duration-feedback outline-none hit-area hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
            sort !== undefined && sort !== 'none' && 'text-foreground',
          )}>
          {children}
          {sort === undefined || sort === 'none' ? (
            <IconArrowsSort
              aria-hidden
              className='size-icon-sm opacity-0 transition-opacity duration-feedback group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100'
            />
          ) : (
            // One arrow that turns, so flipping the direction reads as the same column turning over.
            <IconArrowUp
              aria-hidden
              className={cn(
                'size-icon-sm transition-transform duration-move ease-move motion-reduce:transition-none',
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
const tableCellVariants = cva('py-row-pad-y align-middle', {
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
        'in-[tr:first-child]:border-t in-[tr:first-child]:border-t-(--edge)',
        'first:border-s first:border-s-(--edge) first:ps-card last:border-e last:border-e-(--edge) last:pe-card',
        'in-[tr:first-child]:first:rounded-ss-inner in-[tr:first-child]:last:rounded-se-inner',
        'in-[tr:last-child]:first:rounded-es-inner in-[tr:last-child]:last:rounded-ee-inner',
      ],
    },
    { variant: 'card', section: 'foot', className: 'py-(--table-foot-pad-y)' },
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

const groupBand = 'flex h-(--table-group-height) items-center gap-related text-caption font-medium text-foreground';

/**
 * A flat band across every column that names the rows after it, `--table-group-height` high: lower than a row, so it
 * reads as a label for the rows, not as one of them. Children: an optional leading icon and the name; `count` follows
 * them, muted. Static, or with `onOpenChange` a fold button (`aria-expanded`, a chevron at the end); the call
 * site leaves out the rows of a closed group.
 */
function TableGroupRow({
  colSpan,
  count,
  open = true,
  onOpenChange,
  className,
  children,
  ...props
}: Omit<ComponentProps<'tr'>, 'children'> & {
  /** Columns of the table: the band spans them all. */
  colSpan: number;
  /** The group's rows, shown as a counter after the name. */
  count?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const variant = use(TableVariantContext);
  const content = (
    <>
      {children}
      {count !== undefined && (
        <span data-slot='table-group-count' className='font-normal text-muted-foreground tabular-nums'>
          {count}
        </span>
      )}
    </>
  );
  return (
    <TableRow
      data-slot='table-group-row'
      // `muted`, lightened toward the card, so the rows' hairlines still show against it.
      className={cn(variant !== 'card' && 'bg-muted/65 hover:bg-muted/65', className)}
      {...props}>
      <TableCell
        colSpan={colSpan}
        className='py-0 [--table-cell-fill:color-mix(in_oklch,var(--muted)_65%,var(--card))] in-[tr:hover]:[--table-cell-fill:color-mix(in_oklch,var(--muted)_65%,var(--card))]'>
        {onOpenChange === undefined ? (
          <div className={groupBand}>{content}</div>
        ) : (
          <button
            type='button'
            aria-expanded={open}
            onClick={() => onOpenChange(!open)}
            className={cn(
              groupBand,
              'group/fold relative w-full rounded-control-xs text-left outline-none hit-area focus-visible:ring-3 focus-visible:ring-ring/24',
            )}>
            {content}
            <IconChevronDown
              aria-hidden
              className={cn(
                'ms-auto size-icon-sm shrink-0 text-muted-foreground transition-[rotate,color] duration-move ease-move group-hover/fold:text-foreground motion-reduce:transition-none',
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
