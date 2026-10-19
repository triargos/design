import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const PAYMENTS = [
  { id: '1', item: 'Klassenfahrt Berlin', status: 'paid', group: 'Klasse 7b', amount: 12500 },
  { id: '2', item: 'Schulbuchausleihe', status: 'open', group: 'Klasse 5a', amount: 8750 },
  { id: '3', item: 'Mensa Oktober', status: 'pending', group: 'Klasse 6c', amount: 5200 },
] as const;

const STATUS = {
  paid: { label: 'Bezahlt', intent: 'success' },
  open: { label: 'Offen', intent: 'neutral' },
  pending: { label: 'In Prüfung', intent: 'warning' },
} as const;

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** `variant='flush'` inside InsetCardContent with overflow-hidden: the header row sits in the card. */
export function TableFlush() {
  return (
    <InsetCard className='w-full max-w-2xl'>
      <InsetCardHeader>
        <InsetCardTitle>Zahlungen</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <Table variant='flush'>
          <TableHeader>
            <TableRow>
              <TableHead>Posten</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gruppe</TableHead>
              <TableHead className='text-right'>Betrag</TableHead>
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
                <TableCell className='text-right tabular-nums'>{euro.format(payment.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </InsetCardContent>
    </InsetCard>
  );
}
