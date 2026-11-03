import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import * as Dialog from './dialog.ts';
import type { Child, PartConfig } from './part.ts';

export const { Model, Message, OutMessage, init, update, open, close, isOpen } = Dialog;
export type Model = Dialog.Model;
export type Message = Dialog.Message;
export type OutMessage = Dialog.OutMessage;
export type RenderInfo = Dialog.RenderInfo;

export type SheetSide = 'right' | 'left';
export type SheetSize = 'default' | 'lg';

const SIZE_CLASS: Record<SheetSize, string> = {
  default: 'sm:max-w-sm',
  lg: 'sm:max-w-md',
};

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  content: (render: RenderInfo) => ReadonlyArray<Child>;
  slotId?: string;
  side?: SheetSide;
  size?: SheetSize;
  isCloseButtonShown?: boolean;
  closeLabel?: string;
  hasDescription?: boolean;
  className?: string;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    content,
    slotId,
    side = 'right',
    size = 'default',
    isCloseButtonShown = true,
    closeLabel = Dialog.DEFAULT_CLOSE_LABEL,
    hasDescription,
    className,
  } = config;

  return Dialog.modal(
    {
      model,
      toParentMessage,
      slot: 'sheet',
      slotId,
      hasDescription,
      overlayClassName:
        'fixed inset-0 isolate z-50 bg-black/32 transition-opacity duration-move ease-enter data-closed:opacity-0 supports-backdrop-filter:backdrop-blur-sm',
      contentClassName: cn(
        Dialog.popupClassName,
        'fixed inset-y-0 z-50 h-full w-3/4 transition-[opacity,translate] duration-move ease-enter data-closed:opacity-0 sm:inset-y-2 sm:h-auto sm:rounded-dialog',
        SIZE_CLASS[size],
        'data-[side=right]:right-0 data-[side=right]:rounded-l-dialog data-[side=right]:data-closed:translate-x-10 sm:data-[side=right]:right-2',
        'data-[side=left]:left-0 data-[side=left]:rounded-r-dialog data-[side=left]:data-closed:-translate-x-10 sm:data-[side=left]:left-2',
        'motion-reduce:data-closed:translate-x-0',
        className,
      ),
      contentAttributes: [h.DataAttribute('side', side), h.DataAttribute('size', size)],
      content: (render) => [
        ...content(render),
        ...(isCloseButtonShown ? [Dialog.closeButton(render, closeLabel, h)] : []),
      ],
    },
    h,
  );
};

export const header = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sheet-header'),
      h.Class(
        cn(
          'flex flex-col gap-tight px-modal pt-modal pr-[calc(var(--spacing-modal)+(var(--spacing-control)+var(--text-heading--line-height))/2+2px)] pb-[calc(var(--spacing-group)-var(--spacing-tight))]',
          'in-[[data-slot=sheet-content]:not(:has([data-slot=sheet-body]))]:pb-modal',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const body = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sheet-body'),
      h.Class(
        cn(
          'flex min-h-0 flex-1 flex-col gap-group overflow-y-auto px-modal pt-tight pb-modal',
          'in-[[data-slot=sheet-content]:not(:has([data-slot=sheet-header]))]:pt-modal',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const footer = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sheet-footer'),
      h.Class(
        cn(
          'mt-auto flex shrink-0 flex-col-reverse gap-related border-t bg-muted px-modal py-group sm:flex-row sm:justify-end',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const title = <Message>(
  { render, className, attributes = [], children = [] }: Dialog.LabelConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.h2(
    [
      ...render,
      h.DataAttribute('slot', 'sheet-title'),
      h.Class(cn('text-heading text-balance text-foreground', className)),
      ...attributes,
    ],
    children,
  );

export const description = <Message>(
  { render, className, attributes = [], children = [] }: Dialog.LabelConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      ...render,
      h.DataAttribute('slot', 'sheet-description'),
      h.Class(cn('text-body text-pretty text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );
