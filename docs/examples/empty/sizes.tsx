import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Card, CardContent } from '~/components/ui/card';

/** `sm` for a section inside a card. */
export function EmptySizes() {
  return (
    <div className='grid w-full max-w-2xl gap-4 sm:grid-cols-2'>
      <Card>
        <CardContent className='p-4'>
          <Empty>
            <EmptyMedia />
            <EmptyTitle>No invoices</EmptyTitle>
            <EmptyDescription>Invoices for this workspace show up here.</EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='p-4'>
          <Empty size='sm'>
            <EmptyMedia />
            <EmptyTitle>No invoices</EmptyTitle>
            <EmptyDescription>Invoices for this workspace show up here.</EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
