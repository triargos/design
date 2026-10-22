import { IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FadeIn } from '~/components/ui/fade-in';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { Skeleton } from '~/components/ui/skeleton';

const TASKS = [
  { id: 'brief', title: 'Write the launch brief', project: 'Website relaunch' },
  { id: 'invoices', title: 'Send March invoices', project: 'Finance' },
  { id: 'onboarding', title: 'Onboard Priya', project: 'Team' },
];

/** Skeleton rows while the tasks load, then the rows fade in. */
export function FadeInDefault() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Card className='w-full max-w-md'>
      <CardHeader
        actions={
          <Button size='sm' disabled={loading} onClick={() => setLoading(true)}>
            <IconRefresh data-icon='inline-start' />
            Reload
          </Button>
        }>
        <CardTitle>My tasks</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        {loading ? (
          <div className='flex flex-col gap-group p-card'>
            {TASKS.map((task) => (
              <div key={task.id} className='flex flex-col gap-2'>
                <Skeleton className='h-3.5 w-2/5' />
                <Skeleton className='h-3 w-1/4' />
              </div>
            ))}
          </div>
        ) : (
          <FadeIn>
            <ItemList>
              {TASKS.map((task) => (
                <Item key={task.id}>
                  <ItemContent>
                    <ItemTitle>{task.title}</ItemTitle>
                    <ItemDescription>{task.project}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemList>
          </FadeIn>
        )}
      </CardContent>
    </Card>
  );
}
