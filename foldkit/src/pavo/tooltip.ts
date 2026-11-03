import { Tooltip as TooltipPrimitive } from '@foldkit/ui';
import { Duration, Effect, Number, Schema } from 'effect';
import { Command, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import { type Align, type Side, toPlacement } from './placement.ts';
import type { Child } from './part.ts';

export const { Model, Message, OutMessage, update, reflectShowDelay, triggerId } = TooltipPrimitive;
export type Model = TooltipPrimitive.Model;
export type Message = TooltipPrimitive.Message;
export type OutMessage = TooltipPrimitive.OutMessage;
export type RenderInfo = TooltipPrimitive.RenderInfo;

export const DEFAULT_DELAY = Duration.millis(200);

export type InitConfig = TooltipPrimitive.InitConfig;

export const init = (config: InitConfig): Model => TooltipPrimitive.init({ showDelay: DEFAULT_DELAY, ...config });

export const isOpen = (model: Model): boolean => model.isOpen;

const isOpenedByFocus = (model: Model): boolean => model.isFocused && !model.isHovered;

export const contentClassName = cn(
  'z-50 w-fit max-w-xs rounded-tooltip bg-popover px-(--tooltip-pad-x) py-(--tooltip-pad-y) text-caption text-balance text-popover-foreground shadow-popup',
  'data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left data-[placement=top]:origin-bottom',
  'animate-in duration-enter ease-enter fade-in-0 zoom-in-95 data-instant:animate-none data-[placement=bottom]:slide-in-from-top-1 data-[placement=left]:slide-in-from-right-1 data-[placement=right]:slide-in-from-left-1 data-[placement=top]:slide-in-from-bottom-1',
  'motion-reduce:zoom-in-100 motion-reduce:slide-in-from-top-0 motion-reduce:slide-in-from-left-0',
);

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  trigger: Button.ViewConfig<ParentMessage>;
  content: ReadonlyArray<Child>;
  slotId?: string;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  className?: string;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    trigger,
    content,
    slotId = model.id,
    side = 'top',
    align,
    sideOffset = 6,
    className,
  } = config;

  const toView = (render: RenderInfo): Html =>
    h.span(
      [h.DataAttribute('slot', 'tooltip'), h.Class('contents')],
      [
        Button.view({ ...trigger, attributes: [...render.trigger, ...(trigger.attributes ?? [])] }, h),
        ...(render.isVisible
          ? [
              h.div(
                [
                  ...render.panel,
                  h.DataAttribute('slot', 'tooltip-content'),
                  ...(isOpenedByFocus(model) ? [h.DataAttribute('instant', 'focus')] : []),
                  h.Class(cn(contentClassName, className)),
                ],
                content,
              ),
            ]
          : []),
      ],
    );

  return h.submodel({
    slotId,
    model,
    view: TooltipPrimitive.view,
    viewInputs: {
      anchor: { placement: toPlacement(side, align ?? 'center'), gap: sideOffset, padding: 8 },
      toView,
    },
    toParentMessage,
  });
};

const DELAY_GROUP_TIMEOUT = Duration.millis(400);

export const DelayGroup = Schema.Struct({
  isWarm: Schema.Boolean,
  coolVersion: Schema.Number,
});
export type DelayGroup = typeof DelayGroup.Type;

export const DelayGroupMessage = defineMessageUnion({
  CompletedWaitBeforeCooling: { version: Schema.Number },
});
export type DelayGroupMessage = typeof DelayGroupMessage.Type;

export const initDelayGroup = (): DelayGroup => ({ isWarm: false, coolVersion: 0 });

const WaitBeforeCooling = Command.define('WaitBeforeCooling', {
  args: { version: Schema.Number },
  messages: [DelayGroupMessage.CompletedWaitBeforeCooling],
  execute: ({ version }) =>
    Effect.sleep(DELAY_GROUP_TIMEOUT).pipe(Effect.as(DelayGroupMessage.CompletedWaitBeforeCooling({ version }))),
});

export const showDelayIn = (group: DelayGroup): Duration.Duration => (group.isWarm ? Duration.zero : DEFAULT_DELAY);

export const warmDelayGroup = (group: DelayGroup): Update.Return<DelayGroup, DelayGroupMessage> => ({
  model: modifyFields(group, { isWarm: () => true, coolVersion: Number.increment }),
});

export const coolDelayGroupLater = (group: DelayGroup): Update.Return<DelayGroup, DelayGroupMessage> => {
  const nextVersion = Number.increment(group.coolVersion);
  return {
    model: modifyFields(group, { isWarm: () => true, coolVersion: () => nextVersion }),
    commands: [WaitBeforeCooling({ version: nextVersion })],
  };
};

export const updateDelayGroup = (group: DelayGroup, message: DelayGroupMessage) =>
  DelayGroupMessage.match<Update.Return<DelayGroup, DelayGroupMessage>>(message, {
    CompletedWaitBeforeCooling: ({ version }) =>
      version === group.coolVersion ? { model: modifyFields(group, { isWarm: () => false }) } : { model: group },
  });
