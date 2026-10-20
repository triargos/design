import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const PAYMENTS = [
  { id: '1', item: 'INV-2041', status: 'paid', group: 'Website redesign', amount: 12500 },
  { id: '2', item: 'INV-2042', status: 'open', group: 'Mobile app', amount: 8750 },
  { id: '3', item: 'INV-2043', status: 'pending', group: 'Brand refresh', amount: 5200 },
] as const;

const STATUS = {
  paid: { label: 'Paid', intent: 'success' },
  open: { label: 'Open', intent: 'neutral' },
  pending: { label: 'In review', intent: 'warning' },
} as const;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** `variant='flush'` inside InsetCardContent with overflow-hidden: the header row sits in the card. */
export function TableFlush() {
  return (
    <InsetCard className='w-full max-w-2xl'>
      <InsetCardHeader>
        <InsetCardTitle>Invoices</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <Table variant='flush'>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className='font-medium'>{payment.item}</TableCell>
                <TableCell>
                  <Badge intent={STATUS[payment.status].intent}>{STATUS[payment.status].label}</Badge>
                </TableCell>
                <TableCell>{payment.group}</TableCell>
                <TableCell className='text-right tabular-nums'>{usd.format(payment.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </InsetCardContent>
    </InsetCard>
  );
}
