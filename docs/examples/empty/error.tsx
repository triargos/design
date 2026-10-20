import { IconCloudOff } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** A failure: `role='alert'`, an icon, what happened, and the next step. */
export function EmptyError() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <Empty role='alert'>
          <EmptyMedia variant='icon'>
            <IconCloudOff />
          </EmptyMedia>
          <EmptyTitle>Can’t reach the server</EmptyTitle>
          <EmptyDescription>
            The activity couldn’t be loaded. Your work is saved; try again in a minute.
          </EmptyDescription>
          <EmptyContent>
            <Button intent='primary'>Try again</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}
