import { DragAndDrop } from '@foldkit/ui';
import { Array, Option, pipe } from 'effect';
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { icon } from './icon.ts';

export const { Model, Message, OutMessage, init, update, subscriptions, isDragging, maybeDraggedItemId } = DragAndDrop;
export type Model = DragAndDrop.Model;
export type Message = DragAndDrop.Message;
export type OutMessage = DragAndDrop.OutMessage;

const DEFAULT_HANDLE_LABEL = 'Drag to reorder';

const withoutRole = <Message>(attributes: ReadonlyArray<Attribute<Message>>): ReadonlyArray<Attribute<Message>> =>
  Array.filter(attributes, (attribute) => attribute._tag !== 'Role');

export const list = <Message>(containerId: string): ReadonlyArray<Attribute<Message>> =>
  withoutRole<Message>(DragAndDrop.droppable(containerId));

export const isItemDragging = (model: Model, itemId: string): boolean =>
  isDragging(model) && Option.contains(maybeDraggedItemId(model), itemId);

export const itemClassName = (isDragged: boolean, className?: string): string =>
  cn('relative', isDragged && 'z-10 opacity-80', className);

export const moveItem = <Item>(
  items: ReadonlyArray<Item>,
  toItemId: (item: Item) => string,
  itemId: string,
  toIndex: number,
): ReadonlyArray<Item> =>
  pipe(
    Array.findFirst(items, (item) => toItemId(item) === itemId),
    Option.match({
      onNone: () => items,
      onSome: (movedItem) => {
        const remainingItems = Array.filter(items, (item) => toItemId(item) !== itemId);
        return pipe(
          Array.insertAt(remainingItems, toIndex, movedItem),
          Option.getOrElse(() => Array.append(remainingItems, movedItem)),
        );
      },
    }),
  );

export const previewOrder = <Item>(
  model: Model,
  items: ReadonlyArray<Item>,
  toItemId: (item: Item) => string,
): ReadonlyArray<Item> =>
  isDragging(model)
    ? pipe(
        Option.all({ itemId: maybeDraggedItemId(model), dropTarget: DragAndDrop.maybeDropTarget(model) }),
        Option.match({
          onNone: () => items,
          onSome: ({ itemId, dropTarget }) => moveItem(items, toItemId, itemId, dropTarget.index),
        }),
      )
    : items;

export type HandleConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: DragAndDrop.DraggableMessage) => ParentMessage;
  itemId: string;
  containerId: string;
  index: number;
  ariaLabel?: string | undefined;
  className?: string | undefined;
}>;

export const handle = <ParentMessage>(config: HandleConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, itemId, containerId, index, ariaLabel = DEFAULT_HANDLE_LABEL, className } = config;
  const isPointerDragged = model.dragState._tag === 'Dragging' && isItemDragging(model, itemId);
  const dragAttributes = isPointerDragged
    ? []
    : withoutRole(DragAndDrop.draggable({ model, toParentMessage, itemId, containerId, index }, h));

  return h.button(
    [
      h.Type('button'),
      h.AriaLabel(ariaLabel),
      h.DataAttribute('slot', 'sortable-item-handle'),
      h.Class(
        cn(
          'hit-area relative flex size-control-xs shrink-0 cursor-grab items-center justify-center rounded-control-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24 active:cursor-grabbing in-data-[slot=item-media]:-my-[calc((var(--spacing-control-xs)-var(--spacing-icon))/2)] in-data-[slot=item-media]:-mr-[calc((var(--spacing-control-xs)-var(--spacing-icon))/2)] in-data-[slot=item-media]:-ml-[calc((var(--spacing-control-xs)-var(--spacing-icon))/2+4px)]',
          className,
        ),
      ),
      ...dragAttributes,
    ],
    [icon('grip-vertical', { className: 'size-icon' })],
  );
};
