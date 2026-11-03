import { Anchor, Toast as ToastPrimitive } from '@foldkit/ui';
import { Array, Duration, Effect, Match, Number, Option, Queue, Record, Schema, Stream, pipe } from 'effect';
import { Mount, Subscription, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';
import { defineView } from 'foldkit/submodel';
import { cva } from 'class-variance-authority';

import { buttonVariants } from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import * as Spinner from './spinner.ts';

export const ToastType = Schema.Literals(['Default', 'Success', 'Error', 'Info', 'Warning', 'Loading']);
export type ToastType = typeof ToastType.Type;

const Payload = Schema.Struct({
  type: ToastType,
  title: Schema.String,
  maybeDescription: Schema.Option(Schema.String),
  maybeActionLabel: Schema.Option(Schema.String),
  maybeAnchorId: Schema.Option(Schema.String),
  dedupeKey: Schema.String,
  updateKey: Schema.Number,
});
type Payload = typeof Payload.Type;

const Stack = ToastPrimitive.make(Payload);
type Entry = typeof Stack.Entry.Type;

const DEFAULT_DURATION = Duration.seconds(5);
const ANCHORED_DURATION = Duration.seconds(2);
const VISIBLE_LIMIT = 3;
const LEFT_MOUSE_BUTTON = 0;
const DEFAULT_ARIA_LABEL = 'Notifications';

export const Model = Schema.Struct({
  stack: Stack.Model,
  anchored: Stack.Model,
  heights: Schema.Record(Schema.String, Schema.Number),
  isExpanded: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotStackMessage: { message: Stack.Message },
  GotAnchoredMessage: { message: Stack.Message },
  MeasuredToast: { entryId: Schema.String, height: Schema.Number },
  EnteredViewport: {},
  LeftViewport: {},
  ClickedAction: { id: Schema.String },
  CompletedAnchorToast: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ClickedAction: { id: Schema.String },
});
export type OutMessage = typeof OutMessage.Type;

export type InitConfig = Readonly<{ id: string }>;

export const init = ({ id }: InitConfig): Model => ({
  stack: Stack.init({ id, defaultDuration: DEFAULT_DURATION, swipeToDismiss: { direction: 'Right' } }),
  anchored: Stack.init({ id: `${id}-anchored`, defaultDuration: ANCHORED_DURATION }),
  heights: {},
  isExpanded: false,
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const stackFold = {
  read: (model: Model) => Option.some(model.stack),
  write: (model: Model, nextStack: typeof Stack.Model.Type) => modifyFields(model, { stack: () => nextStack }),
  toParentMessage: (message: typeof Stack.Message.Type): Message => Message.GotStackMessage({ message }),
};

const anchoredFold = {
  read: (model: Model) => Option.some(model.anchored),
  write: (model: Model, nextAnchored: typeof Stack.Model.Type) => modifyFields(model, { anchored: () => nextAnchored }),
  toParentMessage: (message: typeof Stack.Message.Type): Message => Message.GotAnchoredMessage({ message }),
};

const pruneHeights = (model: Model): Model =>
  modifyFields(model, {
    heights: Record.filter((_height, entryId) => Array.some(model.stack.entries, (entry) => entry.id === entryId)),
  });

const foldStackOutMessage = Stack.OutMessage.match<Update.Step<Model, Message>>({
  DismissedToast: () => (stepModel) => ({ model: pruneHeights(stepModel) }),
});

const foldAnchoredOutMessage = Stack.OutMessage.match<Update.Step<Model, Message>>({
  DismissedToast: () => (stepModel) => ({ model: stepModel }),
});

const foldStack = Update.foldChild({ update: Stack.update, ...stackFold, foldOutMessage: foldStackOutMessage });
const foldAnchored = Update.foldChild({
  update: Stack.update,
  ...anchoredFold,
  foldOutMessage: foldAnchoredOutMessage,
});

const foldEveryEntry = (
  model: Model,
  isExpanded: boolean,
  toMessage: (entryId: string) => typeof Stack.Message.Type,
): Update.Return<Model, Message> =>
  Update.combine(model, [
    (stepModel: Model) => ({ model: modifyFields(stepModel, { isExpanded: () => isExpanded }) }),
    ...Array.map(model.stack.entries, (entry) => foldStack(toMessage(entry.id))),
  ]);

export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    GotStackMessage: ({ message }) => foldStack(model, message),
    GotAnchoredMessage: ({ message }) => foldAnchored(model, message),
    MeasuredToast: ({ entryId, height }) => ({
      model: modifyFields(model, { heights: Record.set(entryId, height) }),
    }),
    EnteredViewport: () => foldEveryEntry(model, true, (entryId) => Stack.Message.HoveredEntry({ entryId })),
    LeftViewport: () => foldEveryEntry(model, false, (entryId) => Stack.Message.LeftEntry({ entryId })),
    ClickedAction: ({ id }) => ({ model, outMessage: OutMessage.ClickedAction({ id }) }),
    CompletedAnchorToast: () => ({ model }),
  });

export type ShowInput = Readonly<{
  type?: ToastType;
  title: string;
  description?: string;
  actionLabel?: string;
  anchorId?: string;
  id?: string;
  timeout?: Duration.Duration;
}>;

const toVariant = (type: ToastType): ToastPrimitive.Variant =>
  Match.value(type).pipe(
    Match.withReturnType<ToastPrimitive.Variant>(),
    Match.when('Success', () => 'Success'),
    Match.when('Error', () => 'Error'),
    Match.when('Warning', () => 'Warning'),
    Match.orElse(() => 'Info'),
  );

const dedupeKeyOf = ({ type = 'Default', title, description, anchorId, id }: ShowInput): string =>
  id ?? JSON.stringify([type, title, anchorId === undefined ? (description ?? '') : anchorId]);

const isEntryLeaving = (entry: Entry): boolean =>
  entry.animation.transitionState === 'LeaveStart' || entry.animation.transitionState === 'LeaveAnimating';

const toPayload = (input: ShowInput, updateKey: number): Payload => ({
  type: input.type ?? 'Default',
  title: input.title,
  maybeDescription: Option.fromNullishOr(input.description),
  maybeActionLabel: Option.fromNullishOr(input.actionLabel),
  maybeAnchorId: Option.fromNullishOr(input.anchorId),
  dedupeKey: dedupeKeyOf(input),
  updateKey,
});

const isSticky = (input: ShowInput): boolean =>
  input.type === 'Loading' || (input.timeout !== undefined && Duration.isZero(input.timeout));

type StackModel = typeof Stack.Model.Type;
type StackUpdateReturn = Update.ReturnWithOutMessage<
  StackModel,
  typeof Stack.Message.Type,
  typeof Stack.OutMessage.Type
>;

const upsert = (stack: StackModel, input: ShowInput, defaultDuration: Duration.Duration): StackUpdateReturn => {
  const dedupeKey = dedupeKeyOf(input);
  const maybeExisting = Array.findFirst(
    stack.entries,
    (entry) => entry.payload.dedupeKey === dedupeKey && !isEntryLeaving(entry),
  );

  return Option.match(maybeExisting, {
    onNone: () =>
      Stack.show(stack, {
        payload: toPayload(input, 0),
        variant: toVariant(input.type ?? 'Default'),
        duration: input.timeout ?? defaultDuration,
        sticky: isSticky(input),
      }),
    onSome: (existing) => {
      const maybeDuration = isSticky(input) ? Option.none() : Option.some(input.timeout ?? defaultDuration);
      const nextEntry: Entry = modifyFields(existing, {
        variant: () => toVariant(input.type ?? 'Default'),
        payload: () => toPayload(input, Number.increment(existing.payload.updateKey)),
        maybeDuration: () => maybeDuration,
        pendingDismissVersion: Number.increment,
      });
      return {
        model: modifyFields(stack, {
          entries: Array.map((entry) => (entry.id === existing.id ? nextEntry : entry)),
        }),
        commands: pipe(
          maybeDuration,
          Option.filter(() => !nextEntry.isHovered),
          Option.map((duration) =>
            ToastPrimitive.WaitBeforeDismissal({
              entryId: nextEntry.id,
              version: nextEntry.pendingDismissVersion,
              duration,
            }),
          ),
          Option.toArray,
        ),
      };
    },
  });
};

const foldStackShow = Update.foldChild({
  update: (stack: StackModel, input: ShowInput) => upsert(stack, input, DEFAULT_DURATION),
  ...stackFold,
  foldOutMessage: foldStackOutMessage,
});

const foldAnchoredShow = Update.foldChild({
  update: (anchored: StackModel, input: ShowInput) => upsert(anchored, input, ANCHORED_DURATION),
  ...anchoredFold,
  foldOutMessage: foldAnchoredOutMessage,
});

export const show = (model: Model, input: ShowInput): Update.Return<Model, Message> =>
  input.anchorId === undefined ? foldStackShow(model, input) : foldAnchoredShow(model, input);

const foldStackDismissAll = Update.foldChildStep({
  update: Stack.dismissAll,
  ...stackFold,
  foldOutMessage: foldStackOutMessage,
});
const foldAnchoredDismissAll = Update.foldChildStep({
  update: Stack.dismissAll,
  ...anchoredFold,
  foldOutMessage: foldAnchoredOutMessage,
});

export const dismissAll = (model: Model): Update.Return<Model, Message> =>
  Update.combine(model, [foldStackDismissAll, foldAnchoredDismissAll]);

export const dismiss = (model: Model, id: string): Update.Return<Model, Message> =>
  Option.match(
    Array.findFirst(model.stack.entries, (entry) => entry.payload.dedupeKey === id),
    {
      onNone: () => ({ model }),
      onSome: (entry) => foldStack(model, Stack.Message.Dismissed({ entryId: entry.id })),
    },
  );

export const subscriptions = Subscription.lift(Stack.subscriptions)<Model, Message>({
  read: (model) => Option.some(model.stack),
  toParentMessage: (message) => Message.GotStackMessage({ message }),
});

const MeasureToast = Mount.defineStream('MeasureToast', {
  args: { entryId: Schema.String },
  messages: [Message.MeasuredToast],
  execute: ({ element, entryId }) =>
    Stream.callback<typeof Message.MeasuredToast.Type>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const observer = new ResizeObserver(() => {
            if (element instanceof HTMLElement) {
              Queue.offerUnsafe(queue, Message.MeasuredToast({ entryId, height: element.offsetHeight }));
            }
          });
          observer.observe(element);
          return observer;
        }),
        (observer) => Effect.sync(() => observer.disconnect()),
      ).pipe(Effect.flatMap(() => Effect.never)),
    ),
});

const AnchorToast = Mount.define('AnchorToast', {
  args: { anchorId: Schema.String },
  messages: [Message.CompletedAnchorToast],
  execute: ({ element, anchorId }) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        Anchor.anchorSetup(element, {
          buttonId: anchorId,
          anchor: { placement: 'top', gap: 6, padding: 8 },
          interceptTab: false,
        }),
      ),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedAnchorToast())),
});

const replayVariants = cva('', {
  variants: {
    replay: { none: '', odd: 'motion-reduce:animate-none', even: 'motion-reduce:animate-none' },
    kind: { error: '', other: '' },
  },
  compoundVariants: [
    { replay: 'odd', kind: 'error', className: 'animate-toast-error-odd' },
    { replay: 'even', kind: 'error', className: 'animate-toast-error-even' },
    { replay: 'odd', kind: 'other', className: 'animate-toast-success-odd' },
    { replay: 'even', kind: 'other', className: 'animate-toast-success-even' },
  ],
  defaultVariants: { replay: 'none', kind: 'other' },
});

const toReplay = (updateKey: number): 'none' | 'odd' | 'even' => {
  if (updateKey === 0) {
    return 'none';
  } else if (updateKey % 2 === 0) {
    return 'even';
  } else {
    return 'odd';
  }
};

const replayClassName = ({ type, updateKey }: Payload): string => {
  const replay = toReplay(updateKey);
  return replayVariants({ replay, kind: type === 'Error' ? 'error' : 'other' });
};

const toastClassName = cn([
  'absolute right-0 bottom-0 left-auto top-auto z-[calc(9999-var(--toast-index))] h-(--toast-calc-height) w-full origin-[50%_calc(50%+50%*min(var(--toast-index,0),1))] rounded-popup text-popover-foreground shadow-popup select-none',
  'bg-[color-mix(in_srgb,var(--popover),black_calc(1%*max(0,var(--toast-index,0))))] data-expanded:bg-popover dark:bg-[color-mix(in_srgb,var(--popover),black_calc(6%*max(0,var(--toast-index,0))))] dark:data-expanded:bg-popover',
  '[transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s,background-color_.5s] data-swiping:[transition:none]',
  'after:absolute after:bottom-full after:left-0 after:h-[calc(var(--spacing-part)+1px)] after:w-full',
  '[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))] [--toast-scale:calc(max(0,1-(var(--toast-index)*.1)))] [--toast-shrink:calc(1-var(--toast-scale))]',
  '[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--spacing-part)*-1+var(--toast-swipe-movement-y))]',
  'transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]',
  'data-limited:opacity-0',
  'data-expanded:h-(--toast-height)',
  'data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]',
  'motion-safe:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]',
  'data-ending-style:opacity-0',
  'motion-reduce:[transition:opacity_.5s,height_.15s,background-color_.5s] motion-reduce:data-starting-style:opacity-0',
  'motion-safe:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]',
  'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]',
]);

const TYPE_ICON_CLASS =
  'in-data-[type=error]:text-destructive in-data-[type=info]:text-info in-data-[type=loading]:text-muted-foreground in-data-[type=success]:text-success in-data-[type=warning]:text-warning';

const typeIcon = (type: ToastType): Option.Option<Html> =>
  Match.value(type).pipe(
    Match.withReturnType<Option.Option<Html>>(),
    Match.when('Error', () => Option.some(icon('alert-circle', { className: TYPE_ICON_CLASS }))),
    Match.when('Info', () => Option.some(icon('info-circle', { className: TYPE_ICON_CLASS }))),
    Match.when('Success', () => Option.some(icon('circle-check', { className: TYPE_ICON_CLASS }))),
    Match.when('Warning', () => Option.some(icon('alert-triangle', { className: TYPE_ICON_CLASS }))),
    Match.when('Loading', () => Option.some(Spinner.view({ className: TYPE_ICON_CLASS }))),
    Match.when('Default', () => Option.none()),
    Match.exhaustive,
  );

const transitionAttributeName = (entry: Entry): Option.Option<string> =>
  Match.value(entry.animation.transitionState).pipe(
    Match.withReturnType<Option.Option<string>>(),
    Match.when('EnterStart', () => Option.some('starting-style')),
    Match.whenOr('LeaveStart', 'LeaveAnimating', () => Option.some('ending-style')),
    Match.orElse(() => Option.none()),
  );

const isDismissingBySwipe = (entry: Entry): boolean => entry.swipeState._tag === 'Dismissing';
const isDragging = (entry: Entry): boolean => entry.swipeState._tag === 'Dragging';

const sumHeights = (model: Model, entries: ReadonlyArray<Entry>): number =>
  Array.reduce(entries, 0, (total, entry) => total + (model.heights[entry.id] ?? 0));

export type ViewInputs = Readonly<{ ariaLabel?: string }>;

const stackView = defineView<Model, Message, ViewInputs>((model, viewInputs, h): Html => {
  const { ariaLabel = DEFAULT_ARIA_LABEL } = viewInputs;
  const entries = model.stack.entries;
  const frontmostHeight = pipe(
    Array.last(entries),
    Option.map((entry) => model.heights[entry.id] ?? 0),
    Option.getOrElse(() => 0),
  );

  const entryView = (entry: Entry, position: number): Html => {
    const index = entries.length - 1 - position;
    const newer = Array.drop(entries, position + 1);
    const { payload } = entry;
    const swipeOffset = isDismissingBySwipe(entry) || isDragging(entry) ? Stack.swipeOffset(entry.swipeState) : 0;

    return h.keyed('div')(
      entry.id,
      [
        h.Id(entry.id),
        h.Role(entry.variant === 'Error' || entry.variant === 'Warning' ? 'alert' : 'status'),
        h.AriaAtomic(true),
        h.DataAttribute('slot', 'toast'),
        h.DataAttribute('type', payload.type.toLowerCase()),
        ...(model.isExpanded ? [h.DataAttribute('expanded', '')] : []),
        ...(index >= VISIBLE_LIMIT ? [h.DataAttribute('limited', '')] : []),
        ...Option.toArray(Option.map(transitionAttributeName(entry), (name) => h.DataAttribute(name, ''))),
        ...(isDismissingBySwipe(entry) ? [h.DataAttribute('swipe-direction', 'right')] : []),
        ...(isDragging(entry) ? [h.DataAttribute('swiping', '')] : []),
        h.Style({
          '--toast-index': String(index),
          '--toast-height': `${model.heights[entry.id] ?? 0}px`,
          '--toast-frontmost-height': `${frontmostHeight}px`,
          '--toast-offset-y': `${sumHeights(model, newer)}px`,
          '--toast-swipe-movement-x': `${swipeOffset}px`,
          '--toast-swipe-movement-y': '0px',
          touchAction: 'pan-y',
        }),
        h.OnPointerDown((pointerType, button, _screenX, _screenY, _timeStamp, clientX, _clientY, pointerId) =>
          pointerType === 'mouse' && button !== LEFT_MOUSE_BUTTON
            ? Option.none()
            : Option.some(
                Message.GotStackMessage({
                  message: Stack.Message.PressedEntryPointer({ entryId: entry.id, pointerId, clientX }),
                }),
              ),
        ),
        h.Class(cn(toastClassName, replayClassName(payload))),
      ],
      [
        h.div(
          [
            h.OnMount(MeasureToast({ entryId: entry.id })),
            ...(index > 0 ? [h.DataAttribute('behind', '')] : []),
            ...(model.isExpanded ? [h.DataAttribute('expanded', '')] : []),
            h.Class(
              'pointer-events-auto flex items-center gap-row-gap overflow-hidden px-(--toast-pad-x) py-(--toast-pad-y) text-body transition-opacity duration-move data-behind:opacity-0 data-behind:not-data-expanded:pointer-events-none data-expanded:opacity-100',
            ),
          ],
          [
            ...Option.toArray(
              Option.map(typeIcon(payload.type), (typeIconHtml) =>
                h.div(
                  [
                    h.DataAttribute('slot', 'toast-icon'),
                    h.Class('self-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg]:h-lh [&>svg]:w-icon'),
                  ],
                  [typeIconHtml],
                ),
              ),
            ),
            h.div(
              [h.Class('flex min-w-0 flex-1 flex-col gap-tight wrap-break-word')],
              [
                h.div([h.DataAttribute('slot', 'toast-title'), h.Class('font-medium')], [payload.title]),
                ...Option.toArray(
                  Option.map(payload.maybeDescription, (descriptionText) =>
                    h.div(
                      [h.DataAttribute('slot', 'toast-description'), h.Class('text-muted-foreground')],
                      [descriptionText],
                    ),
                  ),
                ),
              ],
            ),
            ...Option.toArray(
              Option.map(payload.maybeActionLabel, (actionLabel) =>
                h.button(
                  [
                    h.Type('button'),
                    h.DataAttribute('slot', 'toast-action'),
                    h.OnClick(Message.ClickedAction({ id: payload.dedupeKey })),
                    h.Class(buttonVariants({ intent: 'neutral', emphasis: 'solid', className: 'ms-related' })),
                  ],
                  [actionLabel],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  };

  const anchoredEntryView = (entry: Entry): Html =>
    h.keyed('div')(
      entry.id,
      [
        h.Id(entry.id),
        h.Role('status'),
        h.DataAttribute('slot', 'toast-anchored'),
        h.DataAttribute('type', entry.payload.type.toLowerCase()),
        ...Option.toArray(Option.map(transitionAttributeName(entry), (name) => h.DataAttribute(name, ''))),
        h.Style({ position: 'absolute', margin: '0', visibility: 'hidden' }),
        ...Option.toArray(Option.map(entry.payload.maybeAnchorId, (anchorId) => h.OnMount(AnchorToast({ anchorId })))),
        h.Class(
          cn(
            'z-60 w-fit max-w-xs rounded-tooltip bg-popover px-(--tooltip-pad-x) py-(--tooltip-pad-y) text-caption text-balance text-popover-foreground shadow-popup',
            'data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left data-[placement=top]:origin-bottom',
            'transition-[opacity,scale] duration-enter ease-enter data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-95 motion-safe:data-starting-style:scale-95',
            replayClassName(entry.payload),
          ),
        ),
      ],
      [h.div([h.DataAttribute('slot', 'toast-title'), h.Class('pointer-events-auto')], [entry.payload.title])],
    );

  return h.div(
    [h.DataAttribute('slot', 'toasts'), h.Class('contents')],
    [
      h.div(
        [
          h.Role('region'),
          h.AriaLabel(ariaLabel),
          h.AriaLive('polite'),
          h.DataAttribute('slot', 'toast-viewport'),
          h.OnMouseEnter(Message.EnteredViewport()),
          h.OnMouseLeave(Message.LeftViewport()),
          h.Class(
            'fixed right-(--toast-inset) bottom-(--toast-inset) z-60 mx-auto flex w-[calc(100%-var(--toast-inset)*2)] max-w-90 [--toast-inset:--spacing(4)] sm:[--toast-inset:--spacing(8)]',
          ),
        ],
        Array.map(entries, entryView),
      ),
      h.div(
        [h.DataAttribute('slot', 'toast-viewport-anchored'), h.Class('contents')],
        Array.map(model.anchored.entries, anchoredEntryView),
      ),
    ],
  );
});

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  slotId?: string;
  ariaLabel?: string;
}>;

export const view = <ParentMessage>(
  { model, toParentMessage, slotId = model.stack.id, ariaLabel }: ViewConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.submodel({
    slotId,
    model,
    view: stackView,
    viewInputs: ariaLabel === undefined ? {} : { ariaLabel },
    toParentMessage,
  });
