import { IconArrowsSort, IconArrowUp, IconChevronDown } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';
import { type ComponentProps, createContext, type ReactNode, use } from 'react';

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
// - groups: `TableGroupRow`, one full-width band over every column; with `onOpenChange` it folds its rows.

type TableVariant = 'default' | 'flush' | 'card';
type TableSection = 'head' | 'body' | 'foot';

const TableVariantContext = createContext<TableVariant>('default');
const TableSectionContext = createContext<TableSection>('body');

function Table({ className, variant = 'default', ...props }: ComponentProps<'table'> & { variant?: TableVariant }) {
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
          {...props}
        />
      </div>
    </TableVariantContext>
  );
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  const variant = use(TableVariantContext);
  return (
    <TableSectionContext value='head'>
      <thead
        data-slot='table-header'
        className={cn(variant !== 'card' && '[&_tr]:border-b [&_tr]:border-border', className)}
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

// Card rows separate collapsed borders, so row state paints on the cells (`tableCellVariants`).
function TableRow({ className, selected = false, ...props }: ComponentProps<'tr'> & { selected?: boolean }) {
  const variant = use(TableVariantContext);
  const section = use(TableSectionContext);
  return (
    <tr
      data-slot='table-row'
      data-selected={selected || undefined}
      className={cn(
        variant !== 'card' && 'border-b border-border-subtle transition-colors data-selected:bg-muted',
        variant !== 'card' && section === 'body' && 'hover:bg-row-hover',
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
  return (
    <th
      data-slot='table-head'
      aria-sort={sort === undefined || onSort === undefined ? undefined : ariaSortOf[sort]}
      className={cn(
        tableCellEdges({ variant }),
        'h-10 text-left align-middle font-medium whitespace-nowrap text-muted-foreground',
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

// A fold button fills its cell, so it pads the cell's own edge: `card` on a card body or flush, `px-3` otherwise.
const groupRowEdge = { default: 'px-3', flush: 'px-card', card: 'px-card' } as const satisfies Record<
  TableVariant,
  string
>;

/**
 * A full-width band over every column that names the rows after it. Static, or with `onOpenChange` a fold button
 * (`aria-expanded`, a chevron at the end); the call site leaves out the rows of a closed group.
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
      className={cn(variant !== 'card' && 'bg-muted hover:bg-muted', className)}
      {...props}>
      <TableCell
        colSpan={colSpan}
        className={cn(
          'py-0 [--table-cell-fill:var(--muted)] in-[tr:hover]:[--table-cell-fill:var(--muted)]',
          onOpenChange !== undefined && 'p-0 first:ps-0 last:pe-0',
        )}>
        {onOpenChange === undefined ? (
          <div className='flex min-h-9 items-center gap-2 font-medium text-foreground'>{children}</div>
        ) : (
          <button
            type='button'
            aria-expanded={open}
            onClick={() => onOpenChange(!open)}
            className={cn(
              'group/fold flex min-h-9 w-full items-center gap-2 text-left font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:ring-inset',
              groupRowEdge[variant],
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

export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  type TableSort,
  type TableVariant,
};
