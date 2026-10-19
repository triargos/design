import { createColumnHelper, rowSelectionFeature, tableFeatures, useTable } from '@tanstack/react-table';

import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import { InsetCard } from '~/components/ui/inset-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

interface Payment {
  readonly id: string;
  readonly item: string;
  readonly status: 'paid' | 'open' | 'pending';
  readonly group: string;
  readonly amount: number;
}

const PAYMENTS: Array<Payment> = [
  { id: '1', item: 'Klassenfahrt Berlin', status: 'paid', group: 'Klasse 7b', amount: 12500 },
  { id: '2', item: 'Schulbuchausleihe', status: 'open', group: 'Klasse 5a', amount: 8750 },
  { id: '3', item: 'Mensa Oktober', status: 'pending', group: 'Klasse 6c', amount: 5200 },
  { id: '4', item: 'Theaterbesuch', status: 'paid', group: 'Klasse 8a', amount: 3800 },
];

const STATUS = {
  paid: { label: 'Bezahlt', intent: 'success' },
  open: { label: 'Offen', intent: 'neutral' },
  pending: { label: 'In Prüfung', intent: 'warning' },
} as const;

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const features = tableFeatures({ rowSelectionFeature });
const column = createColumnHelper<typeof features, Payment>();

const columns = column.columns([
  column.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label='Alle auswählen'
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label='Zeile auswählen'
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
  }),
  column.accessor('item', {
    header: 'Posten',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <Badge intent={STATUS[getValue()].intent}>{STATUS[getValue()].label}</Badge>,
  }),
  column.accessor('group', { header: 'Gruppe' }),
  column.accessor('amount', {
    header: () => <div className='text-right'>Betrag</div>,
    cell: ({ getValue }) => <div className='text-right tabular-nums'>{euro.format(getValue())}</div>,
  }),
]);

/** TanStack Table v9: `useTable` with `rowSelectionFeature`; a selected row sets `data-state='selected'`. */
export function TableWithSelection() {
  const table = useTable(
    { features, columns, data: PAYMENTS, getRowId: (row) => row.id, initialState: { rowSelection: { '2': true } } },
    (state) => ({ rowSelection: state.rowSelection }),
  );
  return (
    <InsetCard className='w-full max-w-2xl'>
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
            <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </InsetCard>
  );
}
