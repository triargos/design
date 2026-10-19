import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { createContext, useContext } from 'react';

import { cn } from '~/lib/utils';

const SortableItemHandleContext = createContext<Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners'
> | null>(null);

type SortableItemProps = useRender.ComponentProps<'div'> & { id: string };

/**
 * A row that can be dragged. In an `ItemList`, render it as the row itself (`render={<Item />}`) so the list's padding
 * and hairlines reach it.
 */
export const SortableItem = ({ id, render, ...props }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const element = useRender({
    render,
    ref: setNodeRef,
    props: mergeProps<'div'>(
      {
        className: cn('relative', isDragging && 'z-10 opacity-80'),
        style: { transform: CSS.Translate.toString(transform), transition },
      },
      props,
    ),
  });

  return (
    <SortableItemHandleContext.Provider value={{ attributes, listeners }}>{element}</SortableItemHandleContext.Provider>
  );
};

/**
 * The grip. As an `ItemMedia`, it pulls in so the dots, not the button, sit on the row's content edge, and lays out at
 * 16px tall so it centres on the title's line.
 */
export const SortableItemHandle = ({ className }: { className?: string }) => {
  const handle = useContext(SortableItemHandleContext);

  return (
    <button
      type={'button'}
      className={cn(
        'hit-area relative flex size-6 shrink-0 cursor-grab items-center justify-center rounded-control-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24 active:cursor-grabbing in-data-[slot=item-media]:-my-1 in-data-[slot=item-media]:-mr-1 in-data-[slot=item-media]:-ml-2',
        className,
      )}
      {...handle?.listeners}
      {...handle?.attributes}>
      <GripVertical aria-hidden className={'size-4'} />
    </button>
  );
};
