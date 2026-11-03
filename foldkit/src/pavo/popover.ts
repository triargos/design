import { Popover as PopoverPrimitive } from '@foldkit/ui';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { type ButtonSize, buttonVariants } from './button.ts';
import { cn } from './cn.ts';
import { type Align, type Side, toPlacement } from './placement.ts';
import type { Emphasis, Intent } from './intent.ts';
import type { Child, PartConfig } from './part.ts';

export const { Model, Message, OutMessage, init, update, open, close } = PopoverPrimitive;
export type Model = PopoverPrimitive.Model;
export type Message = PopoverPrimitive.Message;
export type OutMessage = PopoverPrimitive.OutMessage;
export type RenderInfo = PopoverPrimitive.RenderInfo;

export const isOpen = (model: Model): boolean => model.isOpen;

export const popupClassName = cn(
  'z-50 flex w-72 flex-col gap-popup rounded-popup bg-popover p-popup text-body text-popover-foreground shadow-popup outline-hidden [--outer-inset:var(--spacing-popup)] [--outer-radius:var(--radius-popup)]',
  'data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left data-[placement=top]:origin-bottom',
  'transition-[opacity,scale,translate] duration-enter ease-enter data-closed:scale-95 data-closed:opacity-0',
  'data-enter:data-closed:data-[placement=bottom]:-translate-y-2 data-enter:data-closed:data-[placement=left]:translate-x-2 data-enter:data-closed:data-[placement=right]:-translate-x-2 data-enter:data-closed:data-[placement=top]:translate-y-2',
  'motion-reduce:data-closed:scale-100 motion-reduce:data-closed:translate-x-0 motion-reduce:data-closed:translate-y-0',
);

const TABBABLE_SELECTOR =
  'button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])';

export type InitialFocus = 'Popup' | 'FirstTabbable';

export type TriggerConfig = Readonly<{
  intent?: Intent;
  emphasis?: Emphasis;
  size?: ButtonSize;
  ariaLabel?: string;
  className?: string;
  children: ReadonlyArray<Child>;
}>;

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  trigger: TriggerConfig;
  content: (render: RenderInfo) => ReadonlyArray<Child>;
  slotId?: string;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  initialFocus?: InitialFocus;
  className?: string;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    trigger,
    content,
    slotId = model.id,
    side = 'bottom',
    align = 'center',
    sideOffset = 4,
    alignOffset = 0,
    initialFocus = 'Popup',
    className,
  } = config;
  const { intent, emphasis, size = 'default', ariaLabel, className: triggerClassName, children } = trigger;

  const toView = (render: RenderInfo): Html =>
    h.div(
      [h.DataAttribute('slot', 'popover'), h.Class('relative inline-flex')],
      [
        h.button(
          [
            ...render.button,
            h.DataAttribute('slot', 'button'),
            h.DataAttribute('size', size),
            ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
            h.Class(buttonVariants({ intent, emphasis, size, className: triggerClassName })),
          ],
          children,
        ),
        ...(render.isVisible
          ? [
              h.div([...render.backdrop, h.Class('fixed inset-0 z-40')]),
              h.div(
                [
                  ...render.panel,
                  h.Role('dialog'),
                  h.DataAttribute('slot', 'popover-content'),
                  h.DataAttribute('surface', 'popup'),
                  h.Class(cn(popupClassName, className)),
                ],
                content(render),
              ),
            ]
          : []),
      ],
    );

  return h.submodel({
    slotId,
    model,
    view: PopoverPrimitive.view,
    viewInputs: {
      anchor: { placement: toPlacement(side, align), gap: sideOffset, offset: alignOffset, padding: 8 },
      toView,
      ...(initialFocus === 'FirstTabbable' ? { focusSelector: `#${model.id}-panel :is(${TABBABLE_SELECTOR})` } : {}),
    },
    toParentMessage,
  });
};

export const header = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'popover-header'),
      h.Class(cn('flex flex-col gap-0.5 text-body', className)),
      ...attributes,
    ],
    children,
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.h2([h.DataAttribute('slot', 'popover-title'), h.Class(cn('font-medium', className)), ...attributes], children);

export const description = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [h.DataAttribute('slot', 'popover-description'), h.Class(cn('text-muted-foreground', className)), ...attributes],
    children,
  );
