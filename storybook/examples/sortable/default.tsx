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
import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { SortableItem, SortableItemHandle } from '~/components/ui/sortable';
import { StatusDot } from '~/components/ui/status-dot';

const INITIAL = [
  { id: 'new', title: 'Neu', description: 'Gerade eingereicht', intent: 'info' },
  { id: 'review', title: 'In Prüfung', description: 'Unterlagen werden geprüft', intent: 'warning' },
  { id: 'accepted', title: 'Zugesagt', description: 'Zusage verschickt', intent: 'success' },
  { id: 'declined', title: 'Abgelehnt', description: 'Absage verschickt', intent: 'destructive' },
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
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Status der Anmeldungen</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <DndContext id='sortable-statuses' sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <ItemList>
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} render={<Item className='flex-nowrap bg-card' />}>
                  <ItemMedia>
                    <SortableItemHandle aria-label={`${item.title} verschieben`} />
                  </ItemMedia>
                  <ItemContent className='flex-none'>
                    <ItemTitle className='whitespace-nowrap'>
                      <StatusDot intent={item.intent} />
                      {item.title}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions className='min-w-0 flex-1 justify-end'>
                    <span className='truncate text-muted-foreground'>{item.description}</span>
                    <Button type='button' intent='neutral' emphasis='ghost' size='icon-xs' aria-label='Mehr'>
                      <MoreHorizontalIcon />
                    </Button>
                  </ItemActions>
                </SortableItem>
              ))}
            </ItemList>
          </SortableContext>
        </DndContext>
      </InsetCardContent>
    </InsetCard>
  );
}
