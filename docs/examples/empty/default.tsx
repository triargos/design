import { UploadIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** In a card: a skeleton stack, a title, one line, one action. */
export function EmptyDefault() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <Empty>
          <EmptyMedia />
          <EmptyTitle>No documents yet</EmptyTitle>
          <EmptyDescription>Uploaded documents show up here, ready to share with the team.</EmptyDescription>
          <EmptyContent>
            <Button>
              <UploadIcon data-icon='inline-start' />
              Upload documents
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}
