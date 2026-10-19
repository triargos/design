import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { InsetCard } from '~/components/ui/inset-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

/** No rows: one cell over every column holds an EmptyState. */
export function TableEmpty() {
  return (
    <InsetCard className='w-full max-w-2xl'>
      <Table variant='card'>
        <TableHeader>
          <TableRow>
            <TableHead>Posten</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Gruppe</TableHead>
            <TableHead className='text-right'>Betrag</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4}>
              <EmptyState size='sm'>
                <EmptyStateTitle>Keine Zahlungen</EmptyStateTitle>
                <EmptyStateDescription>Zahlungen erscheinen hier, sobald Eltern bezahlen.</EmptyStateDescription>
              </EmptyState>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </InsetCard>
  );
}
