import { Dialog as DialogPrimitive } from '@foldkit/ui';
import { Effect, Option, Queue, Schema, Stream } from 'effect';
import { Subscription, Update } from 'foldkit';
import * as Dom from 'foldkit/dom';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';
import { cva } from 'class-variance-authority';

import * as Button from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Child, PartConfig } from './part.ts';

export const Model = Schema.Struct({
  id: Schema.String,
  isOpen: Schema.Boolean,
  isMobile: Schema.Boolean,
  isShortcutBound: Schema.Boolean,
  sheet: DialogPrimitive.Model,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedTrigger: {},
  PressedToggleShortcut: {},
  ChangedViewport: { isMobile: Schema.Boolean },
  ClickedMenuLink: {},
  GotSheetMessage: { message: DialogPrimitive.Message },
});
export type Message = typeof Message.Type;

export type InitConfig = Readonly<{
  id: string;
  isOpen?: boolean;
  isShortcutBound?: boolean;
}>;

export const init = ({ id, isOpen = true, isShortcutBound = false }: InitConfig): Model => ({
  id,
  isOpen,
  isMobile: false,
  isShortcutBound,
  sheet: DialogPrimitive.init({ id: `${id}-sheet`, isAnimated: true }),
});

const toSheetMessage = (message: DialogPrimitive.Message): Message => Message.GotSheetMessage({ message });

const foldSheetOutMessage = DialogPrimitive.OutMessage.match<Update.Step<Model, Message>>({
  Opened: () => (stepModel) => ({ model: stepModel }),
  Closed: () => (stepModel) => ({ model: stepModel }),
});

const sheetFold = {
  read: (model: Model) => Option.some(model.sheet),
  write: (model: Model, nextSheet: DialogPrimitive.Model) => modifyFields(model, { sheet: () => nextSheet }),
  toParentMessage: toSheetMessage,
  foldOutMessage: foldSheetOutMessage,
};

const foldSheet = Update.foldChild({ update: DialogPrimitive.update, ...sheetFold });
const foldSheetOpen = Update.foldChildStep({ update: DialogPrimitive.open, ...sheetFold });
const foldSheetClose = Update.foldChildStep({ update: DialogPrimitive.close, ...sheetFold });

const closeSheet = (model: Model): Update.Return<Model, Message> =>
  model.sheet.isOpen ? foldSheetClose(model) : { model };

const toggle = (model: Model): Update.Return<Model, Message> => {
  if (!model.isMobile) {
    return { model: modifyFields(model, { isOpen: (isOpen) => !isOpen }) };
  } else if (model.sheet.isOpen) {
    return foldSheetClose(model);
  } else {
    return foldSheetOpen(model);
  }
};

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedTrigger: () => toggle(model),
    PressedToggleShortcut: () => toggle(model),
    ChangedViewport: ({ isMobile }) => closeSheet(modifyFields(model, { isMobile: () => isMobile })),
    ClickedMenuLink: () => closeSheet(model),
    GotSheetMessage: ({ message }) => foldSheet(model, message),
  });

const MOBILE_QUERY = '(max-width: 767px)';

const viewportChanges: Stream.Stream<Message> = Stream.callback<Message>((queue) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const query = window.matchMedia(MOBILE_QUERY);
      const emit = () => Queue.offerUnsafe(queue, Message.ChangedViewport({ isMobile: query.matches }));
      emit();
      query.addEventListener('change', emit);
      return () => query.removeEventListener('change', emit);
    }),
    (cleanup) => Effect.sync(cleanup),
  ).pipe(Effect.flatMap(() => Effect.never)),
);

const toggleShortcutPresses: Stream.Stream<Message> = Dom.streamFromEventFilterMapPreventDefault({
  target: window,
  type: 'keydown',
  filterMapEvent: (event) =>
    event.key === '[' && (event.metaKey || event.ctrlKey)
      ? Option.some(Message.PressedToggleShortcut())
      : Option.none(),
});

export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  viewport: entry(
    { id: Schema.String },
    {
      modelToDependencies: (model) => ({ id: model.id }),
      dependenciesToStream: () => viewportChanges,
    },
  ),
  toggleShortcut: entry(
    { isShortcutBound: Schema.Boolean },
    {
      modelToDependencies: (model) => ({ isShortcutBound: model.isShortcutBound }),
      dependenciesToStream: ({ isShortcutBound }) =>
        Stream.when(
          toggleShortcutPresses,
          Effect.sync(() => isShortcutBound),
        ),
    },
  ),
}));

export const provider = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sidebar-wrapper'),
      h.Class(cn('group/sidebar-wrapper flex w-full', className)),
      ...attributes,
    ],
    children,
  );

export type Collapsible = 'offcanvas' | 'icon';

const DEFAULT_SIDEBAR_LABEL = 'Sidebar';

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  collapsible?: Collapsible | undefined;
  label?: string | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

const mobileSheet = <ParentMessage>(
  model: Model,
  toParentMessage: (message: Message) => ParentMessage,
  label: string,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const toView = (render: DialogPrimitive.RenderInfo): Html =>
    h.dialog(
      [...render.dialog, h.DataAttribute('slot', 'sheet')],
      render.isVisible
        ? [
            h.div([
              ...render.backdrop,
              h.DataAttribute('slot', 'sheet-overlay'),
              h.Class(
                'fixed inset-0 isolate z-50 bg-black/32 transition-opacity duration-move ease-enter data-closed:opacity-0 supports-backdrop-filter:backdrop-blur-sm',
              ),
            ]),
            h.div(
              [
                ...render.panel,
                h.DataAttribute('slot', 'sheet-content'),
                h.DataAttribute('surface', 'popup'),
                h.DataAttribute('side', 'left'),
                h.DataAttribute('mobile', 'true'),
                h.Class(
                  cn(
                    'flex flex-col overflow-hidden text-body shadow-modal outline-none',
                    'fixed inset-y-0 left-0 z-50 h-full w-3/4 rounded-r-dialog sm:inset-y-2 sm:left-2 sm:h-auto sm:max-w-sm sm:rounded-dialog',
                    'transition-[opacity,translate] duration-move ease-enter data-closed:-translate-x-10 data-closed:opacity-0 motion-reduce:data-closed:translate-x-0',
                    'w-72 bg-sidebar bg-none p-0 text-sidebar-foreground',
                  ),
                ),
              ],
              [
                h.h2([...render.title, h.Class('sr-only')], [label]),
                h.div([h.DataAttribute('slot', 'sidebar'), h.Class('flex size-full flex-col')], children),
              ],
            ),
          ]
        : [],
    );

  return h.submodel({
    slotId: model.sheet.id,
    model: model.sheet,
    view: DialogPrimitive.view,
    viewInputs: { toView },
    toParentMessage: (message: DialogPrimitive.Message) => toParentMessage(toSheetMessage(message)),
  });
};

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    collapsible = 'offcanvas',
    label = DEFAULT_SIDEBAR_LABEL,
    className,
    children,
  } = config;

  if (model.isMobile) {
    return mobileSheet(model, toParentMessage, label, children, h);
  }

  return h.div(
    [
      h.Class('group peer relative hidden text-sidebar-foreground md:block'),
      h.DataAttribute('state', model.isOpen ? 'expanded' : 'collapsed'),
      h.DataAttribute('collapsible', model.isOpen ? '' : collapsible),
    ],
    [
      h.div([
        h.Class(
          'w-64 transition-[width] duration-move ease-move motion-reduce:transition-none group-data-[collapsible=icon]:w-[calc(var(--spacing-control-sm)+2*var(--spacing-list-inset))] group-data-[collapsible=offcanvas]:w-0',
        ),
      ]),
      h.div(
        [
          h.Class(
            cn(
              'absolute inset-y-0 left-0 z-10 flex w-64 transition-[left,width] duration-move ease-move motion-reduce:transition-none group-data-[collapsible=icon]:w-[calc(var(--spacing-control-sm)+2*var(--spacing-list-inset))] group-data-[collapsible=offcanvas]:-left-64',
              className,
            ),
          ),
        ],
        [h.div([h.DataAttribute('slot', 'sidebar'), h.Class('flex size-full flex-col')], children)],
      ),
    ],
  );
};

const DEFAULT_TRIGGER_LABEL = 'Toggle sidebar';

export type TriggerConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  ariaLabel?: string | undefined;
  className?: string | undefined;
}>;

export const trigger = <ParentMessage>(
  { model, toParentMessage, ariaLabel = DEFAULT_TRIGGER_LABEL, className }: TriggerConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  Button.view(
    {
      emphasis: 'ghost',
      size: 'icon-sm',
      ariaLabel,
      className,
      onClick: toParentMessage(Message.ClickedTrigger()),
      attributes: [
        h.DataAttribute('slot', 'sidebar-trigger'),
        h.AriaExpanded(model.isMobile ? model.sheet.isOpen : model.isOpen),
      ],
      children: [
        model.isOpen
          ? icon('layout-sidebar-left-collapse', { className: 'size-icon-lg' })
          : icon('layout-sidebar-left-expand', { className: 'size-icon' }),
      ],
    },
    h,
  );

export const header = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sidebar-header'),
      h.Class(cn('flex flex-col gap-related p-list-inset', className)),
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
      h.DataAttribute('slot', 'sidebar-footer'),
      h.Class(cn('flex flex-col gap-related p-list-inset', className)),
      ...attributes,
    ],
    children,
  );

export const content = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sidebar-content'),
      h.Class(
        cn(
          'no-scrollbar flex min-h-0 flex-1 flex-col gap-related overflow-auto group-data-[collapsible=icon]:overflow-hidden',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const group = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sidebar-group'),
      h.Class(cn('relative flex w-full min-w-0 flex-col p-list-inset', className)),
      ...attributes,
    ],
    children,
  );

export const groupLabel = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sidebar-group-label'),
      h.Class(
        cn(
          'flex h-control-sm shrink-0 items-center rounded-control px-(--sidebar-label-pad-x) text-caption font-medium text-sidebar-foreground/70 outline-hidden transition-[margin,opacity] duration-move ease-move motion-reduce:transition-opacity focus-visible:ring-3 focus-visible:ring-ring/24 [&>svg]:size-icon [&>svg]:shrink-0',
          'group-data-[collapsible=icon]:-mt-control-sm group-data-[collapsible=icon]:opacity-0',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const groupContent = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'sidebar-group-content'), h.Class(cn('w-full text-body', className)), ...attributes],
    children,
  );

export const menu = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.ul(
    [
      h.DataAttribute('slot', 'sidebar-menu'),
      h.Class(cn('flex w-full min-w-0 flex-col gap-tight', className)),
      ...attributes,
    ],
    children,
  );

export const menuItem = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.li([h.DataAttribute('slot', 'sidebar-menu-item'), h.Class(cn('relative', className)), ...attributes], children);

const sidebarMenuButtonVariants = cva(
  [
    'flex items-center gap-row-gap overflow-hidden px-control-pad-sm text-body outline-hidden focus-visible:ring-3 focus-visible:ring-ring/24 [&>span:last-child]:truncate [&>svg]:size-icon [&>svg]:shrink-0',
    'hover:bg-highlight hover:text-sidebar-accent-foreground active:bg-foreground/10 active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
    'aria-[current=page]:bg-card aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:shadow-raised aria-[current=page]:hover:bg-card dark:aria-[current=page]:bg-foreground/10 dark:aria-[current=page]:hover:bg-foreground/10',
  ],
  {
    variants: {
      level: {
        item: [
          'h-control-sm w-full rounded-control py-[calc((var(--spacing-control-sm)-var(--spacing-icon))/2)] text-left transition-[width,height,padding] motion-reduce:transition-none group-data-[collapsible=icon]:size-control-sm! group-data-[collapsible=icon]:p-[calc((var(--spacing-control-sm)-var(--spacing-icon))/2)]!',
          'data-popup-open:hover:bg-highlight data-popup-open:hover:text-sidebar-accent-foreground',
        ],
        sub: 'h-(--sidebar-sub-height) min-w-0 rounded-control-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden',
      },
      emphasis: {
        ghost: '',
        outline: 'bg-card shadow-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      },
    },
    defaultVariants: { level: 'item', emphasis: 'ghost' },
  },
);

export type MenuButtonConfig<Message> = PartConfig<Message> &
  Readonly<{
    isCurrent?: boolean | undefined;
    emphasis?: 'ghost' | 'outline' | undefined;
    href?: string | undefined;
    onClick?: Message | undefined;
  }>;

export const menuButton = <Message>(
  { isCurrent = false, emphasis, href, onClick, className, attributes = [], children = [] }: MenuButtonConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const buttonAttributes = [
    h.DataAttribute('slot', 'sidebar-menu-button'),
    ...(isCurrent ? [h.AriaCurrent('page')] : []),
    ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
    h.Class(cn(sidebarMenuButtonVariants({ emphasis }), className)),
    ...attributes,
  ];
  return href === undefined
    ? h.button([h.Type('button'), ...buttonAttributes], children)
    : h.a([h.Href(href), ...buttonAttributes], children);
};

export const menuSub = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.ul(
    [
      h.DataAttribute('slot', 'sidebar-menu-sub'),
      h.Class(
        cn(
          'flex min-w-0 flex-col gap-related py-(--sidebar-sub-pad-y) pl-[calc(var(--spacing-control-pad-sm)+var(--spacing-icon)/2+8px)] group-data-[collapsible=icon]:hidden',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const menuSubItem = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.li(
    [
      h.DataAttribute('slot', 'sidebar-menu-sub-item'),
      h.Class(
        cn(
          'relative',
          'before:absolute before:-top-related before:bottom-0 before:left-[-8px] before:w-px before:bg-sidebar-border/60 first:before:-top-(--sidebar-sub-pad-y) last:before:hidden',
          'after:absolute after:-top-related after:left-[-8px] after:h-[calc(var(--spacing-related)+var(--sidebar-sub-height)/2)] after:w-2 after:rounded-bl-[min(var(--radius-control-sm),8px)] after:border-b after:border-l after:border-sidebar-border/60 first:after:-top-(--sidebar-sub-pad-y) first:after:h-[calc(var(--sidebar-sub-pad-y)+var(--sidebar-sub-height)/2)]',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export type MenuSubButtonConfig<Message> = PartConfig<Message> &
  Readonly<{
    isCurrent?: boolean | undefined;
    href?: string | undefined;
    onClick?: Message | undefined;
  }>;

export const menuSubButton = <Message>(
  { isCurrent = false, href, onClick, className, attributes = [], children = [] }: MenuSubButtonConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.a(
    [
      ...(href === undefined ? [] : [h.Href(href)]),
      h.DataAttribute('slot', 'sidebar-menu-sub-button'),
      ...(isCurrent ? [h.AriaCurrent('page')] : []),
      ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
      h.Class(cn(sidebarMenuButtonVariants({ level: 'sub' }), className)),
      ...attributes,
    ],
    children,
  );
