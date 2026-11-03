import { Array, Effect, Option, Queue, Schema, Stream, pipe } from 'effect';
import { Command, Mount, Subscription } from 'foldkit';
import * as Dom from 'foldkit/dom';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';
import type * as Update from 'foldkit/update';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Child, PartAttribute, PartConfig } from './part.ts';

const Size = Schema.Struct({ width: Schema.Number, height: Schema.Number });
type Size = typeof Size.Type;

const LayerSizes = Schema.Struct({ tabs: Size, panel: Size, dock: Size });
type LayerSizes = typeof LayerSizes.Type;

const CurrentTab = Schema.Struct({ left: Schema.Number, width: Schema.Number, height: Schema.Number });

const Indicator = Schema.Struct({ currentTab: CurrentTab, isAnimated: Schema.Boolean });

const PanelDirection = Schema.Literals(['Deeper', 'Back']);

export const Model = Schema.Struct({
  id: Schema.String,
  isPanelOpen: Schema.Boolean,
  panelPath: Schema.Array(Schema.String),
  panelDirection: PanelDirection,
  maybeLayerSizes: Schema.Option(LayerSizes),
  maybeIndicator: Schema.Option(Indicator),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedMoreTab: {},
  ClickedMoreGroup: { groupId: Schema.String },
  ClickedMoreBack: {},
  ClickedMoreItem: { itemId: Schema.String },
  PressedEscape: {},
  PressedPointerOutside: {},
  MeasuredLayers: { sizes: LayerSizes },
  MeasuredCurrentTab: { maybeCurrentTab: Schema.Option(CurrentTab) },
  CompletedFocusPanel: {},
});
export type Message = typeof Message.Type;

export const OutMessage = defineMessageUnion({
  ChoseMoreItem: { itemId: Schema.String },
});
export type OutMessage = typeof OutMessage.Type;

export const init = ({ id }: Readonly<{ id: string }>): Model => ({
  id,
  isPanelOpen: false,
  panelPath: [],
  panelDirection: 'Deeper',
  maybeLayerSizes: Option.none(),
  maybeIndicator: Option.none(),
});

const ROOT_PAGE = 'root';

const shellSelector = (id: string): string => `[data-bottom-nav-shell="${id}"]`;
const activePageRowSelector = (id: string): string =>
  `[data-bottom-nav-panel="${id}"] > [data-active] > :is(a, button)`;
const moreTabSelector = (id: string): string => `${shellSelector(id)} [data-slot=bottom-nav-more]`;
const groupRowSelector = (id: string, groupId: string): string => `${shellSelector(id)} [data-group-row="${groupId}"]`;

const FocusPanel = Command.define('FocusPanel', {
  args: { selector: Schema.String },
  messages: [Message.CompletedFocusPanel],
  execute: ({ selector }) =>
    Dom.focus(selector, { preventScroll: true }).pipe(Effect.ignore, Effect.as(Message.CompletedFocusPanel())),
});

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>;

const closePanel = (model: Model): UpdateReturn => ({
  model: modifyFields(model, { isPanelOpen: () => false, panelPath: () => [] }),
  commands: [FocusPanel({ selector: moreTabSelector(model.id) })],
});

const goBack = (model: Model): UpdateReturn =>
  pipe(
    Array.last(model.panelPath),
    Option.match({
      onNone: () => closePanel(model),
      onSome: (groupId) => ({
        model: modifyFields(model, {
          panelPath: (panelPath) => Array.dropRight(panelPath, 1),
          panelDirection: () => 'Back',
        }),
        commands: [FocusPanel({ selector: groupRowSelector(model.id, groupId) })],
      }),
    }),
  );

export const update = (model: Model, message: Message) =>
  Message.match<UpdateReturn>(message, {
    ClickedMoreTab: () =>
      model.isPanelOpen
        ? { model: modifyFields(model, { isPanelOpen: () => false, panelPath: () => [] }) }
        : {
            model: modifyFields(model, {
              isPanelOpen: () => true,
              panelPath: () => [],
              panelDirection: () => 'Deeper',
            }),
            commands: [FocusPanel({ selector: activePageRowSelector(model.id) })],
          },
    ClickedMoreGroup: ({ groupId }) => ({
      model: modifyFields(model, {
        panelPath: Array.append(groupId),
        panelDirection: () => 'Deeper',
      }),
      commands: [FocusPanel({ selector: activePageRowSelector(model.id) })],
    }),
    ClickedMoreBack: () => goBack(model),
    ClickedMoreItem: ({ itemId }) => ({
      model: modifyFields(model, { isPanelOpen: () => false, panelPath: () => [] }),
      outMessage: OutMessage.ChoseMoreItem({ itemId }),
    }),
    PressedEscape: () => goBack(model),
    PressedPointerOutside: () => ({
      model: modifyFields(model, { isPanelOpen: () => false, panelPath: () => [] }),
    }),
    MeasuredLayers: ({ sizes }) => ({ model: modifyFields(model, { maybeLayerSizes: () => Option.some(sizes) }) }),
    MeasuredCurrentTab: ({ maybeCurrentTab }) => ({
      model: modifyFields(model, {
        maybeIndicator: (maybeIndicator) =>
          Option.map(maybeCurrentTab, (currentTab) => ({ currentTab, isAnimated: Option.isSome(maybeIndicator) })),
      }),
    }),
    CompletedFocusPanel: () => ({ model }),
  });

const isOutsideShell = (id: string, target: EventTarget | null): boolean =>
  !(target instanceof Element) || target.closest(shellSelector(id)) === null;

const panelDismissals = (id: string): Stream.Stream<Message> =>
  Stream.merge(
    Dom.streamFromEventFilterMapPreventDefault({
      target: document,
      type: 'keydown',
      filterMapEvent: (event) => (event.key === 'Escape' ? Option.some(Message.PressedEscape()) : Option.none()),
    }),
    Stream.fromEventListener<PointerEvent>(document, 'pointerdown').pipe(
      Stream.filter((event) => isOutsideShell(id, event.target)),
      Stream.map(() => Message.PressedPointerOutside()),
    ),
  );

export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  panelDismissal: entry(
    { id: Schema.String, isPanelOpen: Schema.Boolean },
    {
      modelToDependencies: (model) => ({ id: model.id, isPanelOpen: model.isPanelOpen }),
      dependenciesToStream: ({ id, isPanelOpen }) =>
        Stream.when(
          panelDismissals(id),
          Effect.sync(() => isPanelOpen),
        ),
    },
  ),
}));

const sizeOf = (element: Element | null): Size =>
  element instanceof HTMLElement
    ? { width: element.offsetWidth, height: element.offsetHeight }
    : { width: 0, height: 0 };

const layerOf = (shell: Element, layer: string): Element | null =>
  shell.querySelector(`:scope > [data-bottom-nav-layer=${layer}]`);

type MeasuredLayers = typeof Message.MeasuredLayers.Type;

const observeLayers = (shell: Element): Stream.Stream<MeasuredLayers> =>
  Stream.callback<MeasuredLayers>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const layers = Array.map(['tabs', 'panel', 'dock'], (layer) => layerOf(shell, layer));
        const emit = () => {
          const sizes = {
            tabs: sizeOf(layerOf(shell, 'tabs')),
            panel: sizeOf(layerOf(shell, 'panel')),
            dock: sizeOf(layerOf(shell, 'dock')),
          };
          if (sizes.tabs.width > 0) {
            Queue.offerUnsafe(queue, Message.MeasuredLayers({ sizes }));
          }
        };
        const resizeObserver = new ResizeObserver(emit);
        Array.forEach(layers, (layer) => {
          if (layer !== null) {
            resizeObserver.observe(layer);
          }
        });
        emit();
        return () => resizeObserver.disconnect();
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.flatMap(() => Effect.never)),
  );

const ObserveBottomNavLayers = Mount.defineStream('ObserveBottomNavLayers', {
  args: { id: Schema.String },
  messages: [Message.MeasuredLayers],
  execute: ({ element }) => observeLayers(element),
});

const CURRENT_TAB_SELECTOR = '[aria-current=page], [data-current]';

type MeasuredCurrentTab = typeof Message.MeasuredCurrentTab.Type;

const measureCurrentTab = (list: Element): MeasuredCurrentTab => {
  const current = list.querySelector(CURRENT_TAB_SELECTOR);
  return Message.MeasuredCurrentTab({
    maybeCurrentTab:
      current instanceof HTMLElement
        ? Option.some({ left: current.offsetLeft, width: current.offsetWidth, height: current.offsetHeight })
        : Option.none(),
  });
};

const observeCurrentTab = (list: Element): Stream.Stream<MeasuredCurrentTab> =>
  Stream.callback<MeasuredCurrentTab>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const emit = () => Queue.offerUnsafe(queue, measureCurrentTab(list));
        const resizeObserver = new ResizeObserver(emit);
        resizeObserver.observe(list);
        Array.forEach(Array.fromIterable(list.children), (child) => resizeObserver.observe(child));
        const mutationObserver = new MutationObserver(emit);
        mutationObserver.observe(list, {
          subtree: true,
          attributes: true,
          attributeFilter: ['aria-current', 'data-current'],
        });
        emit();
        return () => {
          resizeObserver.disconnect();
          mutationObserver.disconnect();
        };
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.flatMap(() => Effect.never)),
  );

const ObserveCurrentTab = Mount.defineStream('ObserveCurrentTab', {
  args: { id: Schema.String },
  messages: [Message.MeasuredCurrentTab],
  execute: ({ element }) => observeCurrentTab(element),
});

export const view = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'bottom-nav'),
      h.Class(
        cn(
          '@container pointer-events-none fixed inset-x-0 bottom-0 z-30 grid items-end px-4 pb-[max(--spacing(4),env(safe-area-inset-bottom))] md:hidden',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export type MoreItem<ParentMessage> = Readonly<{
  _tag: 'Item';
  id: string;
  label: string;
  icon: Html;
  isCurrent?: boolean | undefined;
  href?: string | undefined;
  attributes?: ReadonlyArray<PartAttribute<ParentMessage>> | undefined;
}>;

export type MoreGroup<ParentMessage> = Readonly<{
  _tag: 'Group';
  id: string;
  label: string;
  icon: Html;
  entries: ReadonlyArray<MoreEntry<ParentMessage>>;
}>;

export type MoreEntry<ParentMessage> = MoreItem<ParentMessage> | MoreGroup<ParentMessage>;

export const moreItem = <ParentMessage>(item: Omit<MoreItem<ParentMessage>, '_tag'>): MoreEntry<ParentMessage> => ({
  _tag: 'Item',
  ...item,
});

export const moreGroup = <ParentMessage>(group: Omit<MoreGroup<ParentMessage>, '_tag'>): MoreEntry<ParentMessage> => ({
  _tag: 'Group',
  ...group,
});

const holdsCurrent = <ParentMessage>(entries: ReadonlyArray<MoreEntry<ParentMessage>>): boolean =>
  Array.some(entries, (entry) => (entry._tag === 'Item' ? entry.isCurrent === true : holdsCurrent(entry.entries)));

const groupsOf = <ParentMessage>(
  entries: ReadonlyArray<MoreEntry<ParentMessage>>,
): ReadonlyArray<MoreGroup<ParentMessage>> =>
  Array.flatMap(entries, (entry) => (entry._tag === 'Group' ? [entry, ...groupsOf(entry.entries)] : []));

export type MoreConfig<ParentMessage> = Readonly<{
  entries: ReadonlyArray<MoreEntry<ParentMessage>>;
  label?: string | undefined;
  backLabel?: string | undefined;
}>;

const DEFAULT_MORE_LABEL = 'More';
const DEFAULT_BACK_LABEL = 'Back';
const DEFAULT_LIST_LABEL = 'Main navigation';

const tabClassName = cn(
  'hit-area relative flex size-control-lg shrink-0 items-center justify-center rounded-inner text-muted-foreground outline-hidden select-none',
  'transition-[color,scale] duration-feedback hover:text-foreground active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
  '[&>svg]:pointer-events-none [&>svg]:size-icon-lg [&>svg]:shrink-0 [&>span:not([data-slot=badge])]:sr-only',
  '[&>[data-slot=badge]]:absolute [&>[data-slot=badge]]:top-0.5 [&>[data-slot=badge]]:left-[calc(50%+4px)] [&>[data-slot=badge]]:min-w-(--badge-height-sm) [&>[data-slot=badge]]:tabular-nums',
  'group-data-fill/bottom-nav:grow',
  'group-data-labels/bottom-nav:h-(--bottom-nav-tab-height) group-data-labels/bottom-nav:w-(--bottom-nav-tab-width) group-data-labels/bottom-nav:min-w-0 group-data-labels/bottom-nav:shrink group-data-labels/bottom-nav:flex-col group-data-labels/bottom-nav:gap-0.5',
  'group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:not-sr-only group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:max-w-full group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:truncate group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:px-tight group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:text-caption group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:font-medium',
  'group-data-labels/bottom-nav:[&>[data-slot=badge]]:top-1 group-data-labels/bottom-nav:[&>[data-slot=badge]]:left-[calc(50%+6px)] group-data-labels/bottom-nav:[&>[data-slot=badge]]:ring-2 group-data-labels/bottom-nav:[&>[data-slot=badge]]:ring-popover',
  'aria-[current=page]:text-foreground data-current:text-foreground',
  'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
);

export type LinkConfig<Message> = PartConfig<Message> &
  Readonly<{
    isCurrent?: boolean | undefined;
    href?: string | undefined;
    onClick?: Message | undefined;
  }>;

export const link = <Message>(
  { isCurrent = false, href, onClick, className, attributes = [], children = [] }: LinkConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.a(
    [
      ...(href === undefined ? [] : [h.Href(href)]),
      h.DataAttribute('slot', 'bottom-nav-link'),
      ...(isCurrent ? [h.AriaCurrent('page')] : []),
      ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
      h.Class(cn(tabClassName, className)),
      ...attributes,
    ],
    children,
  );

export type ButtonConfig<Message> = PartConfig<Message> &
  Readonly<{
    isCurrent?: boolean | undefined;
    onClick?: Message | undefined;
  }>;

export const button = <Message>(
  { isCurrent = false, onClick, className, attributes = [], children = [] }: ButtonConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.DataAttribute('slot', 'bottom-nav-button'),
      ...(isCurrent ? [h.DataAttribute('current', '')] : []),
      ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
      h.Class(cn(tabClassName, className)),
      ...attributes,
    ],
    children,
  );

const moreRowClassName = cn(
  'flex min-h-11 w-full shrink-0 items-center gap-(--bottom-nav-gap) rounded-inner px-row-pad-x py-row-pad-y text-start text-control font-medium text-popover-foreground outline-hidden select-none',
  'transition-[background-color,scale,opacity,translate,filter] duration-feedback hover:bg-highlight active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
  '[&>svg]:pointer-events-none [&>svg]:size-icon-lg [&>svg]:shrink-0 [&>svg]:text-muted-foreground [&>span]:truncate',
  'aria-[current=page]:bg-foreground/10 aria-[current]:[&>svg]:text-foreground',
  'in-[[data-bottom-nav-layer]:not([data-shown])]:translate-y-6 in-[[data-bottom-nav-layer]:not([data-shown])]:opacity-0 in-[[data-bottom-nav-layer]:not([data-shown])]:blur-[2px] in-[[data-bottom-nav-layer]:not([data-shown])]:delay-100 in-[[data-bottom-nav-layer]:not([data-shown])]:duration-0',
  'group-data-shown/layer:[transition-delay:calc(90ms+var(--row-index)*15ms)] group-data-shown/layer:[transition-duration:260ms] group-data-shown/layer:ease-[cubic-bezier(0.34,1.3,0.64,1)]',
  'motion-reduce:in-[[data-bottom-nav-layer]:not([data-shown])]:translate-y-0 motion-reduce:in-[[data-bottom-nav-layer]:not([data-shown])]:blur-none',
);

const rowIndexStyle = <ParentMessage>(index: number, h: HtmlBuilder<ParentMessage>) =>
  h.Style({ '--row-index': String(index) });

type PanelContext<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  backLabel: string;
}>;

const moreEntryRow = <ParentMessage>(
  context: PanelContext<ParentMessage>,
  entry: MoreEntry<ParentMessage>,
  index: number,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const { model, toParentMessage } = context;
  if (entry._tag === 'Item') {
    return h.a(
      [
        h.Key(entry.id),
        ...(entry.href === undefined ? [] : [h.Href(entry.href)]),
        h.DataAttribute('slot', 'bottom-nav-more-item'),
        ...(entry.isCurrent === true ? [h.AriaCurrent('page')] : []),
        h.OnClick(toParentMessage(Message.ClickedMoreItem({ itemId: entry.id }))),
        rowIndexStyle(index, h),
        h.Class(moreRowClassName),
        ...(entry.attributes ?? []),
      ],
      [entry.icon, h.span([], [entry.label])],
    );
  } else {
    const pageId = `${model.id}-group-${entry.id}`;
    return h.button(
      [
        h.Key(entry.id),
        h.Type('button'),
        h.DataAttribute('slot', 'bottom-nav-more-group'),
        h.DataAttribute('group-row', entry.id),
        h.AriaExpanded(Option.contains(Array.last(model.panelPath), entry.id)),
        h.AriaControls(pageId),
        ...(holdsCurrent(entry.entries) ? [h.AriaCurrent('true')] : []),
        h.OnClick(toParentMessage(Message.ClickedMoreGroup({ groupId: entry.id }))),
        rowIndexStyle(index, h),
        h.Class(moreRowClassName),
      ],
      [entry.icon, h.span([], [entry.label]), icon('chevron-right', { className: 'ms-auto size-icon! opacity-60' })],
    );
  }
};

const PAGE_ENTER_CLASS: Record<typeof PanelDirection.Type, string> = {
  Deeper: '*:animate-in *:fade-in-0 *:slide-in-from-right-6 *:duration-300 *:ease-enter *:fill-mode-backwards',
  Back: '*:animate-in *:fade-in-0 *:slide-in-from-left-6 *:duration-300 *:ease-enter *:fill-mode-backwards',
};

const panelPage = <ParentMessage>(
  context: PanelContext<ParentMessage>,
  pageId: string,
  maybeGroup: Option.Option<MoreGroup<ParentMessage>>,
  entries: ReadonlyArray<MoreEntry<ParentMessage>>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const { model, toParentMessage, backLabel } = context;
  const activePage = Option.getOrElse(Array.last(model.panelPath), () => ROOT_PAGE);
  const isActive = activePage === pageId;
  const backRow = h.button(
    [
      h.Key('back'),
      h.Type('button'),
      h.DataAttribute('slot', 'bottom-nav-more-back'),
      h.OnClick(toParentMessage(Message.ClickedMoreBack())),
      rowIndexStyle(0, h),
      h.Class(moreRowClassName),
    ],
    [icon('arrow-left'), h.span([], [backLabel])],
  );
  const rowOffset = Option.isSome(maybeGroup) ? 1 : 0;

  return h.keyed('div')(
    pageId,
    [
      ...Option.match(maybeGroup, {
        onNone: () => [],
        onSome: (group) => [h.Id(`${model.id}-group-${group.id}`), h.Role('group'), h.AriaLabel(group.label)],
      }),
      h.DataAttribute('slot', 'bottom-nav-panel-page'),
      h.DataAttribute('page', pageId),
      ...(isActive ? [h.DataAttribute('active', '')] : []),
      h.Class(
        cn(
          'flex w-full flex-col p-list-inset not-data-active:hidden',
          Array.isReadonlyArrayNonEmpty(model.panelPath) || model.panelDirection === 'Back'
            ? PAGE_ENTER_CLASS[model.panelDirection]
            : '',
        ),
      ),
    ],
    [
      ...(Option.isSome(maybeGroup) ? [backRow] : []),
      ...Array.map(entries, (entry, index) => moreEntryRow(context, entry, index + rowOffset, h)),
    ],
  );
};

const indicator = <ParentMessage>(model: Model, h: HtmlBuilder<ParentMessage>): Html =>
  h.span([
    h.AriaHidden(true),
    h.DataAttribute('slot', 'bottom-nav-indicator'),
    ...Option.match(model.maybeIndicator, {
      onNone: () => [],
      onSome: ({ currentTab }) => [
        h.Style({
          '--current-left': `${currentTab.left}px`,
          '--current-width': `${currentTab.width}px`,
          '--current-height': `${currentTab.height}px`,
        }),
      ],
    }),
    h.Class(
      cn(
        'pointer-events-none absolute top-popup-inset left-0 h-(--current-height,var(--spacing-control-lg)) w-(--current-width,var(--spacing-control-lg)) translate-x-(--current-left) rounded-inner bg-foreground/10 transition-[translate,width] duration-move ease-move motion-reduce:transition-none',
        'group-data-labels/bottom-nav:bg-foreground/12 group-data-labels/bottom-nav:duration-indicator group-data-labels/bottom-nav:ease-spring-bounce',
        !Option.exists(model.maybeIndicator, ({ isAnimated }) => isAnimated) && 'transition-none',
        Option.isNone(model.maybeIndicator) && 'invisible',
      ),
    ),
  ]);

type ShownLayer = 'tabs' | 'panel' | 'dock';

const shownLayer = (model: Model, hasDock: boolean): ShownLayer => {
  if (hasDock) {
    return 'dock';
  } else if (model.isPanelOpen) {
    return 'panel';
  } else {
    return 'tabs';
  }
};

export const isAway = (model: Model, hasDock: boolean): boolean => shownLayer(model, hasDock) !== 'tabs';

const LAYER_CLASS = cn(
  'group/layer transition-[opacity,scale,filter] duration-100 ease-out',
  'not-data-shown:pointer-events-none not-data-shown:opacity-0 motion-safe:not-data-shown:scale-80 motion-safe:not-data-shown:blur-[8px]',
);

const layerAttributes = <ParentMessage>(layer: ShownLayer, shown: ShownLayer, h: HtmlBuilder<ParentMessage>) => [
  h.DataAttribute('bottom-nav-layer', layer),
  ...(layer === shown ? [h.DataAttribute('shown', '')] : [h.Inert(true)]),
];

const shellSize = (model: Model, shown: ShownLayer, isLabeled: boolean): Option.Option<Size> =>
  Option.map(model.maybeLayerSizes, (sizes) => {
    if (shown === 'panel') {
      return sizes.panel;
    } else if (shown === 'dock' && !isLabeled) {
      return sizes.dock;
    } else {
      return sizes.tabs;
    }
  });

export type Dock = Readonly<{ isShown: boolean; content: Html }>;

export type ListConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  more?: MoreConfig<ParentMessage> | undefined;
  dock?: Dock | undefined;
  isLabeled?: boolean | undefined;
  isFill?: boolean | undefined;
  ariaLabel?: string | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

export const list = <ParentMessage>(config: ListConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    more,
    dock,
    isLabeled = false,
    isFill = false,
    ariaLabel = DEFAULT_LIST_LABEL,
    className,
    children,
  } = config;
  const shown = shownLayer(model, dock?.isShown === true);
  const panelId = `${model.id}-panel`;
  const context: PanelContext<ParentMessage> = {
    model,
    toParentMessage,
    backLabel: more?.backLabel ?? DEFAULT_BACK_LABEL,
  };

  const moreTab = (moreConfig: MoreConfig<ParentMessage>): Html =>
    button(
      {
        isCurrent: holdsCurrent(moreConfig.entries),
        onClick: toParentMessage(Message.ClickedMoreTab()),
        attributes: [
          h.DataAttribute('slot', 'bottom-nav-more'),
          h.AriaExpanded(model.isPanelOpen),
          h.AriaControls(panelId),
        ],
        children: [icon('dots'), h.span([], [moreConfig.label ?? DEFAULT_MORE_LABEL])],
      },
      h,
    );

  const pages = (moreConfig: MoreConfig<ParentMessage>): ReadonlyArray<Html> => [
    panelPage(context, ROOT_PAGE, Option.none(), moreConfig.entries, h),
    ...Array.map(groupsOf(moreConfig.entries), (group) =>
      panelPage(context, group.id, Option.some(group), group.entries, h),
    ),
  ];

  return h.div(
    [
      h.DataAttribute('slot', 'bottom-nav-shell'),
      h.DataAttribute('surface', 'popup'),
      h.DataAttribute('view', shown),
      h.DataAttribute('bottom-nav-shell', model.id),
      h.OnMount(Mount.mapMessage(ObserveBottomNavLayers({ id: model.id }), toParentMessage)),
      ...Option.match(shellSize(model, shown, isLabeled), {
        onNone: () => [],
        onSome: ({ width, height }) => [h.Style({ width: `${width}px`, height: `${height}px` })],
      }),
      h.Class(
        cn(
          'pointer-events-auto relative col-start-1 row-start-1 flex items-end justify-center justify-self-center overflow-hidden bg-popover text-popover-foreground shadow-popup bar-corners',
          'transition-[width,height] duration-[290ms] ease-spring motion-reduce:transition-none',
          isLabeled && 'max-w-full [--bar-height:calc(var(--bottom-nav-tab-height)+2*var(--spacing-popup-inset))]',
        ),
      ),
    ],
    [
      h.nav(
        [
          ...layerAttributes('tabs', shown, h),
          h.DataAttribute('slot', 'bottom-nav-list'),
          h.AriaLabel(ariaLabel),
          ...(isLabeled ? [h.DataAttribute('labels', '')] : []),
          ...(isFill ? [h.DataAttribute('fill', '')] : []),
          h.OnMount(Mount.mapMessage(ObserveCurrentTab({ id: model.id }), toParentMessage)),
          h.Class(
            cn(
              LAYER_CLASS,
              'data-shown:delay-50 data-shown:duration-180',
              'group/bottom-nav relative flex w-max shrink-0 origin-bottom items-center gap-related p-popup-inset [--outer-inset:var(--spacing-popup-inset)]',
              isLabeled && 'max-w-[100cqw] gap-0',
              isFill && 'w-[100cqw]',
              className,
            ),
          ),
        ],
        [indicator(model, h), ...children, ...(more === undefined ? [] : [moreTab(more)])],
      ),
      h.div(
        [
          ...layerAttributes('panel', shown, h),
          h.Id(panelId),
          h.DataAttribute('slot', 'bottom-nav-panel'),
          h.DataAttribute('bottom-nav-panel', model.id),
          h.Class(
            cn(
              LAYER_CLASS,
              'data-shown:duration-0',
              'absolute top-0 left-1/2 flex no-scrollbar max-h-[calc(100dvh-6rem)] w-[min(17rem,calc(100vw-2rem))] origin-bottom -translate-x-1/2 flex-col overflow-y-auto overscroll-contain [--outer-inset:var(--spacing-list-inset)]',
              shown !== 'panel' && 'overflow-y-hidden',
            ),
          ),
        ],
        more === undefined ? [] : pages(more),
      ),
      h.div(
        [
          ...layerAttributes('dock', shown, h),
          h.DataAttribute('slot', 'bottom-nav-dock'),
          h.Class(
            cn(
              LAYER_CLASS,
              'data-shown:duration-0',
              'absolute origin-bottom',
              isLabeled ? 'inset-0' : 'bottom-0 left-1/2 w-max -translate-x-1/2',
              isLabeled && [
                '[&_[data-slot=action-bar]]:size-full',
                '[&_[data-slot=action-bar]]:[--outer-inset:calc((var(--bottom-nav-tab-height)+2*var(--spacing-popup-inset)-var(--bottom-nav-action-height))/2)]',
                '[&_[data-slot=action-bar-content]]:w-full [&_[data-slot=action-bar-content]]:justify-center [&_[data-slot=action-bar-content]>:first-child:not(:only-child)]:me-auto',
                '[&_[data-slot=action-bar-content]>[data-slot=button]]:h-(--bottom-nav-action-height)',
              ],
            ),
          ),
        ],
        dock === undefined ? [] : [dock.content],
      ),
    ],
  );
};

export type ActionConfig<Message> = PartConfig<Message> &
  Readonly<{
    isAway: boolean;
    ariaLabel: string;
    onClick?: Message | undefined;
  }>;

export const action = <Message>(
  { isAway: isActionAway, ariaLabel, onClick, className, attributes = [], children = [] }: ActionConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      ...(isActionAway ? [h.DataAttribute('away', ''), h.Inert(true)] : []),
      h.Class(
        cn(
          'pointer-events-auto col-start-1 row-start-1 origin-bottom justify-self-end transition-[opacity,scale,filter] duration-move ease-[ease-out]',
          'data-away:opacity-0 data-away:duration-enter data-away:ease-[ease-out] motion-safe:data-away:scale-80 motion-safe:data-away:blur-[8px]',
        ),
      ),
    ],
    [
      h.button(
        [
          h.Type('button'),
          h.DataAttribute('slot', 'bottom-nav-action'),
          h.AriaLabel(ariaLabel),
          ...(onClick === undefined ? [] : [h.OnClick(onClick)]),
          h.Class(
            cn(
              'relative flex size-[calc(var(--spacing-control-lg)+2*var(--spacing-popup-inset))] items-center justify-center bar-corners bg-popover text-popover-foreground shadow-popup outline-hidden select-none',
              'transition-[scale] duration-feedback active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
              '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-icon-lg',
              className,
            ),
          ),
          ...attributes,
        ],
        children,
      ),
    ],
  );
