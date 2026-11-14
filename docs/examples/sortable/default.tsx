import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemMedia, ItemMeta, ItemTitle } from '~/components/ui/item';
import { SortableItemHandle, SortableItemList } from '~/components/ui/sortable';
import { StatusDot } from '~/components/ui/status-dot';

const INITIAL = [
  { id: 'todo', title: 'To do', description: 'Not started yet', intent: 'info' },
  { id: 'progress', title: 'In progress', description: 'Someone is on it', intent: 'warning' },
  { id: 'done', title: 'Done', description: 'Shipped and checked', intent: 'success' },
  { id: 'blocked', title: 'Blocked', description: 'Waiting on something', intent: 'destructive' },
] as const;

/**
 * A `SortableItemList` in a card; each row an `Item` with a `SortableItemHandle` as its media. Only the handle grabs,
 * so the rest of the row stays clickable. Drag, or Tab to the handle + Space, arrows, Space.
 */
export function SortableDefault() {
  const [statuses, setStatuses] = useState<ReadonlyArray<(typeof INITIAL)[number]>>(INITIAL);
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Task statuses</CardTitle>
      </CardHeader>
      <CardContent>
        <SortableItemList
          items={statuses}
          itemKey={(status) => status.id}
          onReorder={setStatuses}
          aria-label='Task statuses'>
          {(status) => (
            <Item>
              <ItemMedia>
                <SortableItemHandle aria-label={`Move ${status.title}`} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <StatusDot intent={status.intent} />
                  <span>{status.title}</span>
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <ItemMeta>{status.description}</ItemMeta>
                <Button emphasis='ghost' size='icon-sm' aria-label={`Actions for ${status.title}`}>
                  <IconDots />
                </Button>
              </ItemActions>
            </Item>
          )}
        </SortableItemList>
      </CardContent>
    </Card>
  );
}
