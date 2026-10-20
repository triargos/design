import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const PAGE = 100;
const TOTAL = 1000;
const PROJECTS = ['Website redesign', 'Mobile app', 'Brand refresh', 'Onboarding'];
const STATUS = [
  { label: 'Paid', intent: 'success' },
  { label: 'Open', intent: 'neutral' },
  { label: 'In review', intent: 'warning' },
] as const;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const page = (from: number) =>
  Array.from({ length: PAGE }, (_, offset) => {
    const index = from + offset;
    return {
      id: String(index),
      invoice: `INV-${String(index + 1).padStart(4, '0')}`,
      project: PROJECTS[index % PROJECTS.length]!,
      status: STATUS[index % STATUS.length]!,
      amount: 400 + ((index * 937) % 12000),
    };
  });

/**
 * `Table virtualized items itemKey`: 1,000 invoices in pages of 100, only the rows in view render. The table scrolls
 * itself (give it a height), the header sticks; `hasMore` + `onLoadMore` page it.
 */
export function TableVirtualized() {
  const [items, setItems] = useState(() => page(0));
  const [loading, setLoading] = useState(false);
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setItems((current) => [...current, ...page(current.length)]);
      setLoading(false);
    }, 800);
  };

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>
          {items.length} of {TOTAL.toLocaleString('en-US')} invoices
        </CardTitle>
      </CardHeader>
      <Table
        virtualized
        variant='card'
        className='h-96'
        aria-label='Invoices'
        aria-rowcount={TOTAL + 1}
        items={items}
        itemKey={(item) => item.id}
        estimatedItemSize={45}
        hasMore={items.length < TOTAL}
        isLoadingMore={loading}
        onLoadMore={loadMore}
        header={
          <TableHeader>
            <TableRow>
              <TableHead className='w-32'>Invoice</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className='w-32'>Status</TableHead>
              <TableHead className='w-28 text-right'>Amount</TableHead>
            </TableRow>
          </TableHeader>
        }>
        {(item) => (
          <TableRow>
            <TableCell className='font-medium tabular-nums'>{item.invoice}</TableCell>
            <TableCell className='truncate'>{item.project}</TableCell>
            <TableCell>
              <Badge intent={item.status.intent}>{item.status.label}</Badge>
            </TableCell>
            <TableCell className='text-right tabular-nums'>{usd.format(item.amount)}</TableCell>
          </TableRow>
        )}
      </Table>
    </Card>
  );
}
