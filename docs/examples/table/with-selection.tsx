import { createColumnHelper, rowSelectionFeature, tableFeatures, useTable } from '@tanstack/react-table';

import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import { Card } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

interface Payment {
  readonly id: string;
  readonly item: string;
  readonly status: 'paid' | 'open' | 'pending';
  readonly group: string;
  readonly amount: number;
}

const PAYMENTS: Array<Payment> = [
  { id: '1', item: 'INV-2041', status: 'paid', group: 'Website redesign', amount: 12500 },
  { id: '2', item: 'INV-2042', status: 'open', group: 'Mobile app', amount: 8750 },
  { id: '3', item: 'INV-2043', status: 'pending', group: 'Brand refresh', amount: 5200 },
  { id: '4', item: 'INV-2044', status: 'paid', group: 'Website redesign', amount: 3800 },
];

const STATUS = {
  paid: { label: 'Paid', intent: 'success' },
  open: { label: 'Open', intent: 'neutral' },
  pending: { label: 'In review', intent: 'warning' },
} as const;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const features = tableFeatures({ rowSelectionFeature });
const column = createColumnHelper<typeof features, Payment>();

const columns = column.columns([
  column.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label='Select all'
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label='Select row'
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
  }),
  column.accessor('item', {
    header: 'Invoice',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <Badge intent={STATUS[getValue()].intent}>{STATUS[getValue()].label}</Badge>,
  }),
  column.accessor('group', { header: 'Project' }),
  column.accessor('amount', {
    header: () => <div className='text-right'>Amount</div>,
    cell: ({ getValue }) => <div className='text-right tabular-nums'>{usd.format(getValue())}</div>,
  }),
]);

/** TanStack Table v9: `useTable` with `rowSelectionFeature`; a selected row is `selected`. */
export function TableWithSelection() {
  const table = useTable(
    { features, columns, data: PAYMENTS, getRowId: (row) => row.id, initialState: { rowSelection: { '2': true } } },
    (state) => ({ rowSelection: state.rowSelection }),
  );
  return (
    <Card className='w-full max-w-2xl'>
      <Table variant='card'>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} selected={row.getIsSelected()}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
