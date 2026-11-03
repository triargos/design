import { Tooltip as TooltipPrimitive } from '@foldkit/ui';
import { Duration, Effect, Number, Option, Schema } from 'effect';
import { Command, Render, Update } from 'foldkit';
import * as Dom from 'foldkit/dom';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import { type Align, type Side, toPlacement } from './placement.ts';
import type { Child } from './part.ts';

export const { OutMessage, triggerId } = TooltipPrimitive;
export type OutMessage = TooltipPrimitive.OutMessage;
export type RenderInfo = TooltipPrimitive.RenderInfo;

export const Model = Schema.Struct({
  tooltip: TooltipPrimitive.Model,
  isDelayGroupWarm: Schema.Boolean,
  isLeaving: Schema.Boolean,
  leaveVersion: Schema.Number,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotTooltipMessage: { message: TooltipPrimitive.Message },
  CompletedLeaveTransition: { version: Schema.Number },
});
export type Message = typeof Message.Type;

const DEFAULT_DELAY = Duration.millis(200);

export type InitConfig = TooltipPrimitive.InitConfig;

export const init = (config: InitConfig): Model => ({
  tooltip: TooltipPrimitive.init({ showDelay: DEFAULT_DELAY, ...config }),
  isDelayGroupWarm: false,
  isLeaving: false,
  leaveVersion: 0,
});

export const isOpen = (model: Model): boolean => model.tooltip.isOpen;

export const isEnteredTrigger = (message: Message): boolean =>
  message._tag === 'GotTooltipMessage' && message.message._tag === 'EnteredTrigger';

const isOpenedByFocus = (tooltip: TooltipPrimitive.Model): boolean => tooltip.isFocused && !tooltip.isHovered;

const panelSelector = (id: string): string => `[data-tooltip-panel="${id}"]`;

const WaitForLeaveTransition = Command.define('WaitForLeaveTransition', {
  args: { id: Schema.String, version: Schema.Number },
  messages: [Message.CompletedLeaveTransition],
  execute: ({ id, version }) =>
    Render.afterPaint.pipe(
      Effect.andThen(Dom.waitForAnimationSettled(panelSelector(id))),
      Effect.as(Message.CompletedLeaveTransition({ version })),
    ),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const foldTooltip = Update.foldChild({
  update: TooltipPrimitive.update,
  read: (model: Model) => Option.some(model.tooltip),
  write: (model: Model, nextTooltip: TooltipPrimitive.Model) => modifyFields(model, { tooltip: () => nextTooltip }),
  toParentMessage: (message: TooltipPrimitive.Message): Message => Message.GotTooltipMessage({ message }),
  toParentOutMessage: (outMessage: OutMessage) => outMessage,
});

const leaveAfter = (previous: Model, next: Model): Update.Return<Model, Message> => {
  const isClosing = previous.tooltip.isOpen && !next.tooltip.isOpen;
  const isInstant = next.tooltip.isDismissed || isOpenedByFocus(previous.tooltip);
  if (next.tooltip.isOpen || (isClosing && isInstant)) {
    return { model: modifyFields(next, { isLeaving: () => false }) };
  } else if (isClosing) {
    const nextLeaveVersion = Number.increment(next.leaveVersion);
    return {
      model: modifyFields(next, { isLeaving: () => true, leaveVersion: () => nextLeaveVersion }),
      commands: [WaitForLeaveTransition({ id: next.tooltip.id, version: nextLeaveVersion })],
    };
  } else {
    return { model: next };
  }
};

export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    GotTooltipMessage: ({ message: tooltipMessage }) => {
      const folded = foldTooltip(model, tooltipMessage);
      const left = leaveAfter(model, folded.model);
      return {
        model: left.model,
        commands: [...(folded.commands ?? []), ...(left.commands ?? [])],
        ...(folded.outMessage === undefined ? {} : { outMessage: folded.outMessage }),
      };
    },
    CompletedLeaveTransition: ({ version }) => ({
      model: version === model.leaveVersion ? modifyFields(model, { isLeaving: () => false }) : model,
    }),
  });

export const focus = (model: Model): Model =>
  update(model, Message.GotTooltipMessage({ message: TooltipPrimitive.Message.FocusedTrigger() })).model;

export const cutLeave = (model: Model): Model => modifyFields(model, { isLeaving: () => false });

const contentClassName = cn(
  'z-50 w-fit max-w-xs rounded-tooltip bg-popover px-(--tooltip-pad-x) py-(--tooltip-pad-y) text-caption text-balance text-popover-foreground shadow-popup',
  'data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left data-[placement=top]:origin-bottom',
  'transition-[opacity,scale] duration-enter ease-enter data-closed:opacity-0 motion-safe:data-closed:scale-95',
  'data-open:not-data-instant:animate-in data-open:transition-none data-open:fade-in-0 data-open:zoom-in-95 data-[placement=bottom]:slide-in-from-top-1 data-[placement=left]:slide-in-from-right-1 data-[placement=right]:slide-in-from-left-1 data-[placement=top]:slide-in-from-bottom-1',
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
    slotId = model.tooltip.id,
    side = 'top',
    align,
    sideOffset = 6,
    className,
  } = config;

  const instantAttributes = (): ReadonlyArray<ReturnType<typeof h.DataAttribute>> => {
    if (!model.tooltip.isOpen) {
      return [h.DataAttribute('closed', '')];
    } else if (isOpenedByFocus(model.tooltip)) {
      return [h.DataAttribute('instant', 'focus')];
    } else if (model.isDelayGroupWarm) {
      return [h.DataAttribute('instant', 'delay')];
    } else {
      return [];
    }
  };

  const toView = (render: RenderInfo): Html =>
    h.span(
      [h.DataAttribute('slot', 'tooltip'), h.Class('contents')],
      [
        Button.view({ ...trigger, attributes: [...render.trigger, ...(trigger.attributes ?? [])] }, h),
        ...(render.isVisible || model.isLeaving
          ? [
              h.div(
                [
                  ...render.panel,
                  h.DataAttribute('slot', 'tooltip-content'),
                  h.DataAttribute('tooltip-panel', model.tooltip.id),
                  ...instantAttributes(),
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
    model: model.tooltip,
    view: TooltipPrimitive.view,
    viewInputs: {
      anchor: { placement: toPlacement(side, align ?? 'center'), gap: sideOffset, padding: 8 },
      toView,
    },
    toParentMessage: (message: TooltipPrimitive.Message) => toParentMessage(Message.GotTooltipMessage({ message })),
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

const showDelayIn = (group: DelayGroup): Duration.Duration => (group.isWarm ? Duration.zero : DEFAULT_DELAY);

export const reflectDelayGroup = (model: Model, group: DelayGroup): Model =>
  modifyFields(model, {
    tooltip: (tooltip) => TooltipPrimitive.reflectShowDelay(tooltip, showDelayIn(group)),
    isDelayGroupWarm: () => group.isWarm,
  });

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
