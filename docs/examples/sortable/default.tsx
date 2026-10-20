import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { SortableItem, SortableItemHandle } from '~/components/ui/sortable';
import { StatusDot } from '~/components/ui/status-dot';

const INITIAL = [
  { id: 'todo', title: 'To do', description: 'Not started yet', intent: 'info' },
  { id: 'progress', title: 'In progress', description: 'Someone is on it', intent: 'warning' },
  { id: 'done', title: 'Done', description: 'Shipped and checked', intent: 'success' },
  { id: 'blocked', title: 'Blocked', description: 'Waiting on something', intent: 'destructive' },
] as const;

/**
 * `SortableContext` in an `ItemList`; each row a `SortableItem` rendered as the `Item`. Only the handle grabs, so the
 * rest of the row stays clickable. Drag, or Tab to the handle + Space, arrows, Space.
 */
export function SortableDefault() {
  const [items, setItems] = useState<ReadonlyArray<(typeof INITIAL)[number]>>(INITIAL);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setItems((current) =>
      arrayMove(
        [...current],
        current.findIndex((item) => item.id === active.id),
        current.findIndex((item) => item.id === over.id),
      ),
    );
  };
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Task statuses</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <DndContext id='sortable-statuses' sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <ItemList>
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} render={<Item className='flex-nowrap bg-card' />}>
                  <ItemMedia>
                    <SortableItemHandle aria-label={`Move ${item.title}`} />
                  </ItemMedia>
                  <ItemContent className='flex-none'>
                    <ItemTitle className='whitespace-nowrap'>
                      <StatusDot intent={item.intent} />
                      {item.title}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions className='min-w-0 flex-1 justify-end'>
                    <span className='truncate text-muted-foreground'>{item.description}</span>
                    <Button emphasis='ghost' size='icon-xs' aria-label={`Actions for ${item.title}`}>
                      <IconDots />
                    </Button>
                  </ItemActions>
                </SortableItem>
              ))}
            </ItemList>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
