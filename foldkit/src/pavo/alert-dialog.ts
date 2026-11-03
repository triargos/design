import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import * as Dialog from './dialog.ts';
import type { Child, PartConfig } from './part.ts';

export const { Model, Message, OutMessage, init, update, open, close, isOpen } = Dialog;
export type Model = Dialog.Model;
export type Message = Dialog.Message;
export type OutMessage = Dialog.OutMessage;
export type RenderInfo = Dialog.RenderInfo;

export type AlertDialogSize = 'default' | 'sm';

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  content: (render: RenderInfo) => ReadonlyArray<Child>;
  slotId?: string;
  size?: AlertDialogSize;
  hasDescription?: boolean;
  className?: string;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, content, slotId, size = 'default', hasDescription, className } = config;
  return Dialog.modal(
    {
      model,
      toParentMessage,
      slot: 'alert-dialog',
      slotId,
      hasDescription,
      isBackdropDismissable: false,
      overlayClassName: Dialog.overlayClassName,
      contentClassName: cn(
        Dialog.popupClassName,
        Dialog.centeredClassName,
        'group/alert-dialog-content max-w-xs data-[size=default]:sm:max-w-sm',
        className,
      ),
      contentAttributes: [h.DataAttribute('size', size)],
      content,
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
      h.DataAttribute('slot', 'alert-dialog-header'),
      h.Class(
        cn(
          'p-modal',
          'grid grid-rows-[auto_1fr] place-items-center gap-tight text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-group sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
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
      h.DataAttribute('slot', 'alert-dialog-footer'),
      h.Class(
        cn(
          'flex flex-col-reverse gap-related border-t bg-muted px-modal py-group sm:flex-row sm:justify-end',
          'group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const media = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'alert-dialog-media'),
      h.Class(
        cn(
          "mb-related inline-flex size-control-lg items-center justify-center rounded-control-lg bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-(--alert-dialog-icon)",
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
      h.DataAttribute('slot', 'alert-dialog-title'),
      h.Class(
        cn(
          'text-heading text-balance sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
          className,
        ),
      ),
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
      h.DataAttribute('slot', 'alert-dialog-description'),
      h.Class(
        cn(
          'text-body text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const action = <Message>(config: Button.ViewConfig<Message>, h: HtmlBuilder<Message>): Html =>
  Button.view(
    {
      intent: 'primary',
      ...config,
      attributes: [h.DataAttribute('slot', 'alert-dialog-action'), ...(config.attributes ?? [])],
    },
    h,
  );

export type CancelConfig = Readonly<{
  render: RenderInfo;
  size?: Button.ButtonSize;
  className?: string;
  children: ReadonlyArray<Child>;
}>;

export const cancel = <Message>({ render, size, className, children }: CancelConfig, h: HtmlBuilder<Message>): Html =>
  Button.view(
    {
      ...(size === undefined ? {} : { size }),
      ...(className === undefined ? {} : { className }),
      attributes: [...render.closeButton, h.DataAttribute('slot', 'alert-dialog-cancel')],
      children,
    },
    h,
  );
