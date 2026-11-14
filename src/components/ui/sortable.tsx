import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { type ComponentProps, createContext, type ReactNode, use, useId } from 'react';

import { ItemListFrame, ItemListRow } from '~/components/ui/item';
import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

const SortableItemHandleContext = createContext<Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners'
> | null>(null);

const SORTABLE_MODIFIERS = [restrictToVerticalAxis, restrictToParentElement];

type SortableItemListProps<T> = Omit<ComponentProps<typeof ItemListFrame>, 'children'> & {
  readonly items: ReadonlyArray<T>;
  readonly itemKey: (item: T) => string;
  /** The items in their new order, after a row is dropped in a new place. */
  readonly onReorder: (items: T[]) => void;
  /** A row: one `Item`, its handle a `SortableItemHandle`. */
  readonly children: (item: T, index: number) => ReactNode;
};

/**
 * An `ItemList` a person puts in order: each row moves by its `SortableItemHandle`, up and down within the list, so the
 * rest of the row stays clickable. The pointer drags; the keyboard lifts with Space, moves with the arrows, drops with
 * Space. The moving row lifts onto the popup surface, opaque, so the rows it passes do not show through.
 */
function SortableItemList<T>({ items, itemKey, onReorder, children, ...props }: SortableItemListProps<T>) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const keys = items.map(itemKey);
  const reorderOnDrop = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove([...items], keys.indexOf(String(active.id)), keys.indexOf(String(over.id))));
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={SORTABLE_MODIFIERS}
      onDragEnd={reorderOnDrop}>
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        <ItemListFrame {...props}>
          {items.map((item, index) => (
            <SortableItemListRow
              key={itemKey(item)}
              id={itemKey(item)}
              first={index === 0}
              last={index === items.length - 1}>
              {children(item, index)}
            </SortableItemListRow>
          ))}
        </ItemListFrame>
      </SortableContext>
    </DndContext>
  );
}

function SortableItemListRow({ id, ...props }: ComponentProps<typeof ItemListRow> & { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <SortableItemHandleContext value={{ attributes, listeners }}>
      <ItemListRow
        ref={setNodeRef}
        className={cn(isDragging && 'z-10 bg-popover shadow-popup after:opacity-0')}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        {...props}
      />
    </SortableItemHandleContext>
  );
}

/**
 * The grip; name the row in its `aria-label` (`Move Design review`). As an `ItemMedia`, it pulls in so the dots, not
 * the button, sit on the row's content edge (the grip glyph's 4px side bearing on the start), and lays out at the icon's
 * height so it centres on the title's line.
 */
function SortableItemHandle({ className, 'aria-label': ariaLabel, ...props }: ComponentProps<'button'>) {
  const { labels } = useLocale();
  const handle = use(SortableItemHandleContext);

  return (
    <button
      type='button'
      aria-label={ariaLabel ?? labels.dragToReorder}
      className={cn(
        'hit-area relative flex size-control-xs shrink-0 cursor-grab touch-none items-center justify-center rounded-control-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24 active:cursor-grabbing in-data-[slot=item-media]:-my-[calc((var(--spacing-control-xs)-var(--spacing-icon))/2)] in-data-[slot=item-media]:-mr-[calc((var(--spacing-control-xs)-var(--spacing-icon))/2)] in-data-[slot=item-media]:-ml-[calc((var(--spacing-control-xs)-var(--spacing-icon))/2+4px)]',
        className,
      )}
      {...props}
      {...handle?.listeners}
      {...handle?.attributes}>
      <IconGripVertical aria-hidden className='size-icon' />
    </button>
  );
}

export { SortableItemHandle, SortableItemList };
