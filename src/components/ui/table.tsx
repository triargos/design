import { cva } from 'class-variance-authority';
import { type ComponentProps, createContext, use } from 'react';

import { cn } from '~/lib/utils';

// Markup for a TanStack Table (`useTable`, `table.FlexRender`) or a static table. Three variants:
// - `default`: a plain table; rows separated by hairlines.
// - `flush`: `default` filling a card edge to edge, as an `ItemList` does:
//   `<CardContent className='overflow-hidden'><Table variant='flush'>`. The first and last column sit `group` in,
//   on the card header's text.
// - `card`: the table is the content of an `Card`, in place of `CardContent`. Header and footer rows sit on
//   the shell; the body is the card (`bg-card`, an `--edge` ring, `rounded-inner` corners). Put it straight in the
//   shell: `<Card><Table variant='card'>…</Table></Card>`.

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

// Flush and card: the first and last cell line up with `CardHeader` text (`group` + the card's 1px edge in). Flush
// cells sit inside the edge already; card head and foot cells sit on the shell, so they add the 1px. A checkbox column
// shrinks to the box.
const tableCellEdges = cva(
  'has-[[role=checkbox]]:w-px first:has-[[role=checkbox]]:pe-0 last:has-[[role=checkbox]]:ps-0',
  {
    variants: {
      variant: {
        default: 'px-3',
        flush: 'px-3 first:ps-group last:pe-group',
        card: 'px-3 first:ps-[calc(var(--spacing-group)+1px)] last:pe-[calc(var(--spacing-group)+1px)]',
      },
    },
  },
);

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  const variant = use(TableVariantContext);
  return (
    <th
      data-slot='table-head'
      className={cn(
        tableCellEdges({ variant }),
        'h-10 text-left align-middle font-medium whitespace-nowrap text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

// Card body: the cells are the card, not the `tbody` (a `tbody` is no containing block in Safari, so a surface hung on
// it lands on the table). Each cell fills with `bg-card`; the outer cells carry the `--edge` ring as a border, and
// `bg-clip-padding` keeps the fill inside it, so the ring sits on the shell, as `CardContent` does. Separators are
// `border-subtle` (opaque, so the shell behind the clipped border does not show). The first and last cell pad `group`
// inside the edge, on the head and foot cells' `group` + 1px. WebKit antialiases each cell's fill at fractional column
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
        'first:border-s first:border-s-(--edge) first:ps-group last:border-e last:border-e-(--edge) last:pe-group',
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

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
