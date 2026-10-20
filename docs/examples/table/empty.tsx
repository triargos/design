import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Card } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

/** No rows: one cell over every column holds an Empty. */
export function TableEmpty() {
  return (
    <Card className='w-full max-w-2xl'>
      <Table variant='card'>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4}>
              <Empty size='sm'>
                <EmptyMedia />
                <EmptyTitle>No invoices</EmptyTitle>
                <EmptyDescription>Invoices show up here once you send one.</EmptyDescription>
              </Empty>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
