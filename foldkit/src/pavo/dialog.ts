import { Dialog as DialogPrimitive } from '@foldkit/ui';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Child, PartAttribute, PartConfig } from './part.ts';

export const { Model, Message, OutMessage, init, update, open, close } = DialogPrimitive;
export type Model = DialogPrimitive.Model;
export type Message = DialogPrimitive.Message;
export type OutMessage = DialogPrimitive.OutMessage;
export type RenderInfo = DialogPrimitive.RenderInfo;

export type DialogSize = 'sm' | 'default' | 'lg' | 'xl';

const SIZE_CLASS: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  default: 'sm:max-w-md',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

const DEFAULT_CLOSE_LABEL = 'Close';

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  content: (render: RenderInfo) => ReadonlyArray<Child>;
  slotId?: string;
  size?: DialogSize;
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
    slotId = model.id,
    size = 'default',
    isCloseButtonShown = true,
    closeLabel = DEFAULT_CLOSE_LABEL,
    hasDescription = false,
    className,
  } = config;

  const closeButton = (render: RenderInfo): Html =>
    Button.view(
      {
        emphasis: 'ghost',
        size: 'icon',
        ariaLabel: closeLabel,
        attributes: render.closeButton,
        className:
          'absolute top-[calc(var(--spacing-modal)-(var(--spacing-control)-var(--text-heading--line-height))/2)] right-[calc(var(--spacing-modal)-(var(--spacing-control)-var(--text-heading--line-height))/2)]',
        children: [icon('x')],
      },
      h,
    );

  const toView = (render: RenderInfo): Html =>
    h.dialog(
      [...render.dialog, h.DataAttribute('slot', 'dialog')],
      render.isVisible
        ? [
            h.div([
              ...render.backdrop,
              h.DataAttribute('slot', 'dialog-overlay'),
              h.Class(
                'fixed inset-0 isolate z-50 bg-black/32 transition-opacity duration-modal ease-enter data-closed:opacity-0 supports-backdrop-filter:backdrop-blur-sm',
              ),
            ]),
            h.div(
              [
                ...render.panel,
                h.DataAttribute('slot', 'dialog-content'),
                h.DataAttribute('surface', 'popup'),
                h.DataAttribute('size', size),
                h.Class(
                  cn(
                    'flex flex-col overflow-hidden bg-popover text-body text-popover-foreground shadow-modal outline-none',
                    'fixed top-[round(50%,1px)] left-[round(50%,1px)] z-50 w-full translate-x-[round(-50%,1px)] translate-y-[round(-50%,1px)] rounded-dialog',
                    'transition-[opacity,scale] duration-modal ease-enter data-closed:scale-[0.97] data-closed:opacity-0 motion-reduce:data-closed:scale-100',
                    'max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] sm:min-w-min',
                    SIZE_CLASS[size],
                    className,
                  ),
                ),
              ],
              [...content(render), ...(isCloseButtonShown ? [closeButton(render)] : [])],
            ),
          ]
        : [],
    );

  return h.submodel({
    slotId,
    model,
    view: DialogPrimitive.view,
    viewInputs: { toView, hasDescription },
    toParentMessage,
  });
};

export const header = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'dialog-header'),
      h.Class(
        cn(
          'flex flex-col gap-tight px-modal pt-modal pr-[calc(var(--spacing-modal)+(var(--spacing-control)+var(--text-heading--line-height))/2+2px)] pb-[calc(var(--spacing-group)-var(--spacing-tight))]',
          'in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-body]))]:pb-modal',
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
      h.DataAttribute('slot', 'dialog-body'),
      h.Class(
        cn(
          'flex min-h-0 flex-col gap-group overflow-y-auto px-modal pt-tight pb-modal',
          'in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-header]))]:pt-modal',
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
      h.DataAttribute('slot', 'dialog-footer'),
      h.Class(
        cn(
          'flex shrink-0 flex-col-reverse gap-related border-t bg-muted px-modal py-group sm:flex-row sm:justify-end',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export type LabelConfig<Message> = PartConfig<Message> &
  Readonly<{
    render: ReadonlyArray<PartAttribute<Message>>;
  }>;

export const title = <Message>(
  { render, className, attributes = [], children = [] }: LabelConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.h2(
    [
      ...render,
      h.DataAttribute('slot', 'dialog-title'),
      h.Class(cn('text-heading text-balance', className)),
      ...attributes,
    ],
    children,
  );

export const description = <Message>(
  { render, className, attributes = [], children = [] }: LabelConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      ...render,
      h.DataAttribute('slot', 'dialog-description'),
      h.Class(
        cn(
          'text-body text-pretty text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );
