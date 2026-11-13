import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { Modifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { type ComponentProps, createContext, use } from 'react';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

const SortableItemHandleContext = createContext<Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners'
> | null>(null);

type SortableItemProps = useRender.ComponentProps<'div'> & { id: string };

/**
 * A row that can be dragged. In an `ItemList`, render it as the row itself (`render={<Item />}`) so the list's padding
 * and hairlines reach it. While it moves it lifts onto the popup surface, opaque, so the rows it passes do not show
 * through.
 */
function SortableItem({ id, render, ...props }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const element = useRender({
    render,
    ref: setNodeRef,
    props: mergeProps<'div'>(
      {
        className: cn('relative', isDragging && 'z-10 bg-popover shadow-popup'),
        style: { transform: CSS.Translate.toString(transform), transition },
      },
      props,
    ),
  });

  return <SortableItemHandleContext value={{ attributes, listeners }}>{element}</SortableItemHandleContext>;
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

/**
 * A `DndContext` modifier: the dragged row moves only up and down, and only within its `ItemList`. Each row sits in a
 * row wrapper of its own, so dnd-kit's `restrictToParentElement` would pin it in place.
 */
const restrictToItemList: Modifier = ({ transform, activatorEvent, draggingNodeRect }) => {
  const list =
    activatorEvent?.target instanceof Element ? activatorEvent.target.closest('[data-slot=item-list]') : null;
  if (!list || !draggingNodeRect) return { ...transform, x: 0 };
  const bounds = list.getBoundingClientRect();
  const y = Math.min(Math.max(transform.y, bounds.top - draggingNodeRect.top), bounds.bottom - draggingNodeRect.bottom);
  return { ...transform, x: 0, y };
};

export { restrictToItemList, SortableItem, SortableItemHandle };
