import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** `Empty size='sm'` in the content. */
export function CardEmpty() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <Empty size='sm'>
          <EmptyMedia />
          <EmptyTitle>No documents yet</EmptyTitle>
          <EmptyDescription>Uploaded documents show up here.</EmptyDescription>
        </Empty>
      </CardContent>
    </Card>
  );
}
