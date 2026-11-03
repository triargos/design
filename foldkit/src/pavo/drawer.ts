import { Array, type Cause, Effect, Option, Queue, Record, Schema, Stream } from 'effect';
import { Command, Dom, Mount, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import * as Dialog from './dialog.ts';
import { icon } from './icon.ts';
import type { Child, PartConfig } from './part.ts';

const SWIPE_START_DISTANCE = 4;
const SWIPE_DISMISS_RATIO = 0.25;
const SWIPE_DISMISS_VELOCITY = 0.5;
const DEFAULT_BACK_LABEL = 'Back';

export const Direction = Schema.Literals(['Open', 'Push', 'Pop']);
export type Direction = typeof Direction.Type;

export const Model = Schema.Struct({
  dialog: Dialog.Model,
  initialPage: Schema.String,
  history: Schema.Array(Schema.String),
  direction: Direction,
  pageHeights: Schema.Record(Schema.String, Schema.Number),
  swipeOffset: Schema.Number,
  swipeProgress: Schema.Number,
  isSwiping: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  GotDialogMessage: { message: Dialog.Message },
  ClickedPush: { page: Schema.String },
  ClickedBack: {},
  MeasuredPage: { page: Schema.String, height: Schema.Number },
  MovedSwipe: { offset: Schema.Number, progress: Schema.Number },
  ReleasedSwipe: { isDismissed: Schema.Boolean },
  CompletedFocusDrawerControl: {},
});
export type Message = typeof Message.Type;

export type InitConfig = Readonly<{ id: string; initialPage: string }>;

export const init = ({ id, initialPage }: InitConfig): Model => ({
  dialog: Dialog.init({ id, isAnimated: true, focusSelector: `#${id}-panel` }),
  initialPage,
  history: [initialPage],
  direction: 'Open',
  pageHeights: {},
  swipeOffset: 0,
  swipeProgress: 0,
  isSwiping: false,
});

export const isOpen = (model: Model): boolean => Dialog.isOpen(model.dialog);

export const currentPage = (model: Model): string =>
  Option.getOrElse(Array.last(model.history), () => model.initialPage);

export const backButtonId = (model: Model, page: string): string => `${model.dialog.id}-back-${page}`;
export const pushTriggerId = (model: Model, page: string): string => `${model.dialog.id}-push-${page}`;

const FocusDrawerControl = Command.define('FocusDrawerControl', {
  args: { selector: Schema.String },
  messages: [Message.CompletedFocusDrawerControl],
  execute: ({ selector }) =>
    Dom.focus(selector, { preventScroll: true }).pipe(Effect.ignore, Effect.as(Message.CompletedFocusDrawerControl())),
});

type UpdateReturn = Update.Return<Model, Message>;

const dialogFold = {
  read: (model: Model) => Option.some(model.dialog),
  write: (model: Model, nextDialog: Dialog.Model) => modifyFields(model, { dialog: () => nextDialog }),
  toParentMessage: (message: Dialog.Message): Message => Message.GotDialogMessage({ message }),
};

const foldDialogOutMessage = Dialog.OutMessage.match<Update.Step<Model, Message>>({
  Opened: () => (stepModel) => ({ model: stepModel }),
  Closed: () => (stepModel) => ({ model: stepModel }),
});

const foldDialog = Update.foldChild({ update: Dialog.update, ...dialogFold, foldOutMessage: foldDialogOutMessage });
const foldDialogOpen = Update.foldChildStep({
  update: Dialog.open,
  ...dialogFold,
  foldOutMessage: foldDialogOutMessage,
});
const foldDialogClose = Update.foldChildStep({
  update: Dialog.close,
  ...dialogFold,
  foldOutMessage: foldDialogOutMessage,
});

const resetStack = (model: Model): Model =>
  modifyFields(model, {
    history: () => [model.initialPage],
    direction: () => 'Open',
    swipeOffset: () => 0,
    swipeProgress: () => 0,
    isSwiping: () => false,
  });

export const open = (model: Model): UpdateReturn => foldDialogOpen(resetStack(model));
export const close = (model: Model): UpdateReturn => foldDialogClose(model);

export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    GotDialogMessage: ({ message }) => foldDialog(model, message),
    ClickedPush: ({ page }) => ({
      model: modifyFields(model, { history: Array.append(page), direction: () => 'Push' }),
      commands: [FocusDrawerControl({ selector: `#${backButtonId(model, page)}` })],
    }),
    ClickedBack: () =>
      Option.match(Array.last(model.history), {
        onNone: () => ({ model }),
        onSome: (poppedPage) =>
          model.history.length > 1
            ? {
                model: modifyFields(model, { history: Array.dropRight(1), direction: () => 'Pop' }),
                commands: [FocusDrawerControl({ selector: `#${pushTriggerId(model, poppedPage)}` })],
              }
            : { model },
      }),
    MeasuredPage: ({ page, height }) => ({
      model: modifyFields(model, { pageHeights: Record.set(page, height) }),
    }),
    MovedSwipe: ({ offset, progress }) => ({
      model: modifyFields(model, { swipeOffset: () => offset, swipeProgress: () => progress, isSwiping: () => true }),
    }),
    ReleasedSwipe: ({ isDismissed }) => {
      const settled = modifyFields(model, { swipeOffset: () => 0, swipeProgress: () => 0, isSwiping: () => false });
      return isDismissed ? foldDialogClose(settled) : { model: settled };
    },
    CompletedFocusDrawerControl: () => ({ model }),
  });

const MeasurePage = Mount.defineStream('MeasurePage', {
  args: { page: Schema.String },
  messages: [Message.MeasuredPage],
  execute: ({ element, page }) =>
    Stream.callback<typeof Message.MeasuredPage.Type>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const observer = new ResizeObserver(() => {
            if (element instanceof HTMLElement) {
              Queue.offerUnsafe(queue, Message.MeasuredPage({ page, height: element.offsetHeight }));
            }
          });
          observer.observe(element);
          return observer;
        }),
        (observer) => Effect.sync(() => observer.disconnect()),
      ).pipe(Effect.flatMap(() => Effect.never)),
    ),
});

type SwipeMessage = typeof Message.MovedSwipe.Type | typeof Message.ReleasedSwipe.Type;

const isInScrolledPage = (target: EventTarget | null): boolean =>
  target instanceof Element &&
  Option.exists(Option.fromNullishOr(target.closest('[data-slot=drawer-page]')), (page) => page.scrollTop > 0);

const observeSwipe = (element: Element, queue: Queue.Queue<SwipeMessage, Cause.Done>): (() => void) => {
  if (!(element instanceof HTMLElement)) {
    return () => undefined;
  }

  let maybeStart: Option.Option<Readonly<{ pointerId: number; y: number }>> = Option.none();
  let isDragging = false;
  let isClickSuppressed = false;
  let offset = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0;

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || isInScrolledPage(event.target)) {
      return;
    }

    maybeStart = Option.some({ pointerId: event.pointerId, y: event.clientY });
    isDragging = false;
    isClickSuppressed = false;
    offset = 0;
    lastY = event.clientY;
    lastTime = event.timeStamp;
    velocity = 0;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (Option.isNone(maybeStart) || maybeStart.value.pointerId !== event.pointerId) {
      return;
    }

    const distance = event.clientY - maybeStart.value.y;

    if (!isDragging && distance < -SWIPE_START_DISTANCE) {
      maybeStart = Option.none();
      return;
    }

    if (!isDragging && distance > SWIPE_START_DISTANCE) {
      isDragging = true;
      element.setPointerCapture(event.pointerId);
    }

    if (isDragging) {
      const elapsed = Math.max(1, event.timeStamp - lastTime);
      velocity = (event.clientY - lastY) / elapsed;
      lastY = event.clientY;
      lastTime = event.timeStamp;
      offset = Math.max(0, distance);
      Queue.offerUnsafe(
        queue,
        Message.MovedSwipe({ offset, progress: Math.min(1, offset / Math.max(1, element.offsetHeight)) }),
      );
    }
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (Option.isNone(maybeStart) || maybeStart.value.pointerId !== event.pointerId) {
      return;
    }

    if (isDragging) {
      isClickSuppressed = true;
      const isDismissed = offset > element.offsetHeight * SWIPE_DISMISS_RATIO || velocity > SWIPE_DISMISS_VELOCITY;
      Queue.offerUnsafe(queue, Message.ReleasedSwipe({ isDismissed }));
    }

    maybeStart = Option.none();
    isDragging = false;
  };

  const onClickCapture = (event: MouseEvent) => {
    if (isClickSuppressed) {
      event.stopPropagation();
      event.preventDefault();
      isClickSuppressed = false;
    }
  };

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerEnd);
  element.addEventListener('pointercancel', onPointerEnd);
  element.addEventListener('click', onClickCapture, true);

  return () => {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', onPointerEnd);
    element.removeEventListener('pointercancel', onPointerEnd);
    element.removeEventListener('click', onClickCapture, true);
  };
};

const ObserveDrawerSwipe = Mount.defineStream('ObserveDrawerSwipe', {
  messages: [Message.MovedSwipe, Message.ReleasedSwipe],
  execute: ({ element }) =>
    Stream.callback<SwipeMessage>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => observeSwipe(element, queue)),
        (cleanup) => Effect.sync(cleanup),
      ).pipe(Effect.flatMap(() => Effect.never)),
    ),
});

export type PageConfig = Readonly<{
  page: string;
  title?: string;
  className?: string;
  children: ReadonlyArray<Child>;
}>;

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  ariaLabel: string;
  pages: ReadonlyArray<PageConfig>;
  backLabel?: string;
  slotId?: string;
  className?: string;
}>;

type Position = 'current' | 'behind' | 'ahead';

const positionOf = (model: Model, page: string): Position => {
  if (page === currentPage(model)) {
    return 'current';
  } else if (Array.contains(model.history, page)) {
    return 'behind';
  } else {
    return 'ahead';
  }
};

const rowsClassName = cn(
  '[&_[data-drawer-row]]:transition-[opacity,translate,filter] [&_[data-drawer-row]]:duration-120 [&_[data-drawer-row]]:ease-[cubic-bezier(0.4,0,0.2,1)]',
  'data-[position=behind]:[&_[data-drawer-row]]:-translate-x-4 data-[position=behind]:[&_[data-drawer-row]]:opacity-0 data-[position=behind]:[&_[data-drawer-row]]:blur-[2px]',
  'data-[position=ahead]:[&_[data-drawer-row]]:translate-x-4 data-[position=ahead]:[&_[data-drawer-row]]:opacity-0 data-[position=ahead]:[&_[data-drawer-row]]:blur-[2px]',
  'data-[position=current]:[&_[data-drawer-row]]:animate-in data-[position=current]:[&_[data-drawer-row]]:fade-in-0 data-[position=current]:[&_[data-drawer-row]]:blur-in-[4px] data-[position=current]:[&_[data-drawer-row]]:fill-mode-both data-[position=current]:[&_[data-drawer-row]]:animation-duration-[440ms] data-[position=current]:[&_[data-drawer-row]]:ease-spring',
  'in-data-[direction=Open]:data-[position=current]:[&_[data-drawer-row]]:slide-in-from-bottom-6 in-data-[direction=Push]:data-[position=current]:[&_[data-drawer-row]]:slide-in-from-right-6 in-data-[direction=Pop]:data-[position=current]:[&_[data-drawer-row]]:slide-in-from-left-6',
  '[&_[data-drawer-row]:nth-child(2)]:delay-[20ms] [&_[data-drawer-row]:nth-child(3)]:delay-[40ms] [&_[data-drawer-row]:nth-child(4)]:delay-[60ms] [&_[data-drawer-row]:nth-child(5)]:delay-[80ms] [&_[data-drawer-row]:nth-child(6)]:delay-[100ms]',
  'motion-reduce:[&_[data-drawer-row]]:animate-none motion-reduce:transition-opacity',
);

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, ariaLabel, pages, backLabel = DEFAULT_BACK_LABEL, slotId, className } = config;
  const toDialogMessage = (message: Dialog.Message): ParentMessage =>
    toParentMessage(Message.GotDialogMessage({ message }));
  const maybeStackHeight = Option.fromNullishOr(model.pageHeights[currentPage(model)]);
  const isHistoryDeep = model.history.length > 1;

  const pageHeader = (page: string, title: string): Html =>
    h.div(
      [
        h.DataAttribute('slot', 'drawer-page-header'),
        h.Class('relative flex h-control-lg shrink-0 items-center justify-center'),
      ],
      [
        Button.view(
          {
            emphasis: 'ghost',
            size: 'icon-lg',
            ariaLabel: backLabel,
            onClick: toParentMessage(Message.ClickedBack()),
            className: 'absolute left-0 rounded-full [&>svg]:size-icon-lg',
            attributes: [h.Id(backButtonId(model, page)), h.DataAttribute('slot', 'drawer-back')],
            children: [icon('chevron-left')],
          },
          h,
        ),
        h.h2(
          [
            h.Id(`${model.dialog.id}-title-${page}`),
            h.Class('truncate px-control-lg text-[1rem] leading-6 font-medium'),
          ],
          [title],
        ),
      ],
    );

  const pageView = ({ page, title, className: pageClassName, children }: PageConfig): Html => {
    const position = positionOf(model, page);
    return h.keyed('div')(
      page,
      [
        h.Role('group'),
        ...(title === undefined ? [] : [h.AriaLabelledBy(`${model.dialog.id}-title-${page}`)]),
        h.DataAttribute('slot', 'drawer-page'),
        h.DataAttribute('page', page),
        h.DataAttribute('position', position),
        h.Inert(position !== 'current'),
        h.OnMount(Mount.mapMessage(MeasurePage({ page }), toParentMessage)),
        h.Class(
          cn(
            'flex no-scrollbar max-h-[calc(100dvh-4rem-var(--drawer-page-pad)*3)] w-full flex-col gap-(--drawer-page-pad) overflow-y-auto overscroll-contain px-(--drawer-page-pad) pb-(--drawer-page-pad)',
            'transition-opacity duration-120 data-[position=ahead]:pointer-events-none data-[position=ahead]:absolute data-[position=ahead]:inset-x-0 data-[position=ahead]:top-0 data-[position=ahead]:opacity-0',
            'data-[position=behind]:pointer-events-none data-[position=behind]:absolute data-[position=behind]:inset-x-0 data-[position=behind]:top-0 data-[position=behind]:opacity-0 data-[position=behind]:delay-120',
            rowsClassName,
            pageClassName,
          ),
        ),
      ],
      [...(title === undefined ? [] : [pageHeader(page, title)]), ...children],
    );
  };

  return Dialog.modal(
    {
      model: model.dialog,
      toParentMessage: toDialogMessage,
      slot: 'drawer',
      slotId,
      overlayClassName: cn(
        'fixed inset-0 isolate z-50 bg-black/32 supports-backdrop-filter:backdrop-blur-xs',
        'opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-drawer ease-spring data-closed:opacity-0 data-swiping:duration-0',
      ),
      overlayAttributes: [
        h.Style({ '--drawer-swipe-progress': String(model.swipeProgress) }),
        ...(model.isSwiping ? [h.DataAttribute('swiping', '')] : []),
      ],
      contentClassName: cn(
        Dialog.popupClassName,
        'fixed inset-x-(--drawer-inset) bottom-[calc(var(--drawer-inset)+env(safe-area-inset-bottom))] z-50 mx-auto max-h-[calc(100dvh-4rem)] w-auto max-w-md rounded-(--drawer-radius)',
        '[transform:translateY(var(--drawer-swipe-movement-y,0px))] transition-[transform,opacity] duration-drawer ease-spring data-swiping:transition-none data-swiping:select-none',
        'data-closed:[transform:translateY(calc(100%+var(--drawer-inset)+env(safe-area-inset-bottom)))]',
        'motion-reduce:data-closed:[transform:none] motion-reduce:data-closed:opacity-0',
        className,
      ),
      contentAttributes: [
        h.AriaLabel(ariaLabel),
        h.Tabindex(-1),
        h.Style({ '--drawer-swipe-movement-y': `${model.swipeOffset}px` }),
        ...(model.isSwiping ? [h.DataAttribute('swiping', '')] : []),
        h.OnMount(Mount.mapMessage(ObserveDrawerSwipe(), toParentMessage)),
      ],
      content: () => [
        h.div(
          [
            h.AriaHidden(true),
            h.DataAttribute('slot', 'drawer-grabber'),
            h.Class('flex shrink-0 justify-center pt-related pb-(--drawer-page-pad)'),
          ],
          [h.div([h.Class('h-1 w-9 rounded-full bg-border')])],
        ),
        h.div(
          [
            h.DataAttribute('slot', 'drawer-stack'),
            h.DataAttribute('direction', model.direction),
            ...(isHistoryDeep ? [h.DataAttribute('deep', '')] : []),
            ...Option.toArray(Option.map(maybeStackHeight, (height) => h.Style({ height: `${height}px` }))),
            h.Class(
              'relative min-h-0 shrink overflow-hidden transition-[height] duration-fold ease-spring motion-reduce:transition-none',
            ),
          ],
          Array.map(pages, pageView),
        ),
      ],
    },
    h,
  );
};

export const menuGroup = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'drawer-menu-group'),
      h.Class(
        cn(
          'relative flex flex-col',
          '[[data-slot=drawer-menu-group]+&]:pt-(--drawer-page-pad) [[data-slot=drawer-menu-group]+&]:before:absolute [[data-slot=drawer-menu-group]+&]:before:inset-x-(--drawer-menu-item-pad-x) [[data-slot=drawer-menu-group]+&]:before:top-0 [[data-slot=drawer-menu-group]+&]:before:h-px [[data-slot=drawer-menu-group]+&]:before:bg-border-subtle',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

const menuRowClassName = cn(
  'flex min-h-(--drawer-menu-item-height) w-full items-center gap-(--drawer-menu-item-pad-x) rounded-(--drawer-menu-item-radius) px-(--drawer-menu-item-pad-x) text-[1rem] leading-6 text-popover-foreground select-none',
  '[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:first-child]:size-icon-lg [&>svg:first-child]:text-muted-foreground',
  '[&>span:not([data-slot])]:min-w-0 [&>span:not([data-slot])]:flex-1 [&>span:not([data-slot])]:truncate',
);

const pressableRowClassName = cn(
  'text-left outline-hidden transition-colors duration-feedback hover:bg-highlight focus-visible:ring-3 focus-visible:ring-ring/24 active:bg-highlight',
  'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
);

export type MenuItemConfig<Message> = PartConfig<Message> &
  Readonly<{
    onClick?: Message;
    isPush?: boolean;
    intent?: 'neutral' | 'destructive';
  }>;

export const menuItem = <Message>(
  { onClick, isPush = false, intent = 'neutral', className, attributes = [], children = [] }: MenuItemConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.DataAttribute('slot', 'drawer-menu-item'),
      h.DataAttribute('intent', intent),
      h.DataAttribute('drawer-row', ''),
      ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
      h.Class(
        cn(
          menuRowClassName,
          pressableRowClassName,
          'data-[intent=destructive]:text-destructive data-[intent=destructive]:[&>svg:first-child]:text-destructive',
          className,
        ),
      ),
      ...attributes,
    ],
    [
      ...children,
      ...(isPush
        ? [
            h.span(
              [h.DataAttribute('slot', 'drawer-menu-chevron'), h.AriaHidden(true), h.Class('flex')],
              [icon('chevron-right', { className: 'size-icon text-faint-foreground' })],
            ),
          ]
        : []),
    ],
  );

export const menuRow = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'drawer-menu-row'),
      h.DataAttribute('drawer-row', ''),
      h.Class(cn(menuRowClassName, className)),
      ...attributes,
    ],
    children,
  );

export const menuValue = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'drawer-menu-value'),
      h.Class(cn('max-w-[50%] shrink-0 truncate text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

export const optionGroup = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Role('radiogroup'),
      h.DataAttribute('slot', 'drawer-option-group'),
      h.Class(cn('flex flex-col', className)),
      ...attributes,
    ],
    children,
  );

export type OptionConfig<Message> = PartConfig<Message> &
  Readonly<{
    isChecked: boolean;
    onClick?: Message;
  }>;

export const option = <Message>(
  { isChecked, onClick, className, attributes = [], children = [] }: OptionConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.Role('radio'),
      h.AriaChecked(isChecked),
      h.DataAttribute('slot', 'drawer-option'),
      h.DataAttribute('drawer-row', ''),
      ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
      h.Class(
        cn(
          'group/drawer-option flex min-h-(--drawer-menu-item-height) w-full items-center gap-part rounded-(--drawer-option-radius) px-(--drawer-menu-item-pad-x) py-(--drawer-page-pad) text-[1rem] leading-6 text-popover-foreground select-none',
          pressableRowClassName,
          className,
        ),
      ),
      ...attributes,
    ],
    [
      ...children,
      h.span(
        [h.DataAttribute('slot', 'drawer-option-check'), h.AriaHidden(true), h.Class('flex')],
        [
          icon('check', {
            className:
              'pointer-events-none size-icon-lg shrink-0 scale-60 text-primary opacity-0 [transition:opacity_var(--transition-duration-move)_ease,scale_var(--transition-duration-press)_var(--ease-spring-bounce)] group-aria-checked/drawer-option:scale-100 group-aria-checked/drawer-option:opacity-100 motion-reduce:scale-100',
          }),
        ],
      ),
    ],
  );

export const optionMedia = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'drawer-option-media'),
      h.Class(
        cn(
          'flex size-control-lg shrink-0 items-center justify-center overflow-hidden rounded-control bg-muted text-caption font-medium text-muted-foreground [&>img]:size-full [&>img]:object-cover [&>svg]:size-icon-lg',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const optionContent = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'drawer-option-content'),
      h.Class(cn('flex min-w-0 flex-1 flex-col', className)),
      ...attributes,
    ],
    children,
  );

export const optionTitle = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [h.DataAttribute('slot', 'drawer-option-title'), h.Class(cn('line-clamp-2 font-medium', className)), ...attributes],
    children,
  );

export const optionDescription = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'drawer-option-description'),
      h.Class(cn('truncate text-body text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );

export const footnote = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'drawer-footnote'),
      h.DataAttribute('drawer-row', ''),
      h.Class(cn('px-(--drawer-menu-item-pad-x) pb-related text-caption text-pretty text-muted-foreground', className)),
      ...attributes,
    ],
    children,
  );
