import { VirtualList } from '@foldkit/ui';
import { Array } from 'effect';
import { childAttributes, type Html, type HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Child, PartAttribute, PartConfig } from './part.ts';
import * as Skeleton from './skeleton.ts';
import * as Spinner from './spinner.ts';

const rowClassName = (isLast: boolean): string =>
  cn(
    '*:data-[slot=item]:p-row-pad-x',
    !isLast &&
      'relative after:absolute after:right-row-pad-x after:bottom-0 after:left-row-pad-x after:h-px after:bg-border-subtle',
  );

const listRow = <Message>(
  isLast: boolean,
  attributes: ReadonlyArray<PartAttribute<Message>>,
  child: Child,
  h: HtmlBuilder<Message>,
): Html => h.div([h.DataAttribute('slot', 'item-list-row'), h.Class(rowClassName(isLast)), ...attributes], [child]);

export type ListConfig<Message> = PartConfig<Message> &
  Readonly<{
    ariaLabel?: string | undefined;
    ariaLabelledBy?: string | undefined;
  }>;

export const list = <Message>(
  { ariaLabel, ariaLabelledBy, className, attributes = [], children = [] }: ListConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'item-list'), h.Class(cn('overflow-hidden', className)), ...attributes],
    [
      h.div(
        [
          h.Role('list'),
          ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
          ...(ariaLabelledBy === undefined ? [] : [h.AriaLabelledBy(ariaLabelledBy)]),
        ],
        children.map((row, index) => listRow(index === children.length - 1, [h.Role('listitem')], row, h)),
      ),
    ],
  );

const SKELETON_TITLE_WIDTHS = ['w-40', 'w-32', 'w-48'] as const;
const SKELETON_DESCRIPTION_WIDTHS = ['w-64', 'w-56', 'w-72'] as const;

export type SkeletonMedia = 'icon' | 'avatar';

export type ListSkeletonConfig<Message> = Omit<PartConfig<Message>, 'children'> &
  Readonly<{
    rows?: number | undefined;
    media?: SkeletonMedia | undefined;
    hasDescription?: boolean | undefined;
  }>;

const skeletonMedia = <Message>(media: SkeletonMedia | undefined, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  if (media === 'icon') {
    return [
      mediaPart(
        {
          variant: 'icon',
          className: 'bg-transparent',
          children: [Skeleton.view({ className: 'size-full rounded-[inherit]' }, h)],
        },
        h,
      ),
    ];
  }
  if (media === 'avatar') {
    return [mediaPart({ children: [Skeleton.view({ className: 'size-10 rounded-full' }, h)] }, h)];
  }
  return [];
};

const skeletonRow = <Message>(
  index: number,
  media: SkeletonMedia | undefined,
  hasDescription: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  view(
    {
      className: 'flex-nowrap',
      children: [
        ...skeletonMedia(media, h),
        content(
          {
            children: [
              title(
                {
                  className: 'h-lh',
                  children: [
                    Skeleton.view(
                      {
                        className: cn('h-3.5 max-w-full', SKELETON_TITLE_WIDTHS[index % SKELETON_TITLE_WIDTHS.length]),
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              ...(hasDescription
                ? [
                    h.div(
                      [h.DataAttribute('slot', 'item-description'), h.Class('flex h-lh items-center')],
                      [
                        Skeleton.view(
                          {
                            className: cn(
                              'h-3 max-w-full',
                              SKELETON_DESCRIPTION_WIDTHS[index % SKELETON_DESCRIPTION_WIDTHS.length],
                            ),
                          },
                          h,
                        ),
                      ],
                    ),
                  ]
                : []),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

export const listSkeleton = <Message>(
  { rows = 3, media, hasDescription = true, className, attributes = [] }: ListSkeletonConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'item-list'),
      h.AriaHidden(true),
      h.Class(cn('overflow-hidden', className)),
      ...attributes,
    ],
    Array.makeBy(rows, (index) => listRow(index === rows - 1, [], skeletonRow(index, media, hasDescription, h), h)),
  );

export type ViewConfig<Message> = PartConfig<Message> &
  Readonly<{
    isSelected?: boolean | undefined;
    href?: string | undefined;
  }>;

export const view = <Message>(
  { isSelected = false, href, className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const itemAttributes = [
    h.DataAttribute('slot', 'item'),
    ...(isSelected ? [h.DataAttribute('selected', '')] : []),
    h.Class(
      cn(
        'group/item flex w-full flex-wrap items-center gap-(--item-gap) rounded-block border border-transparent px-row-pad-x py-row-pad-y text-body transition-colors duration-feedback outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24 in-data-[slot=item-list]:rounded-none in-data-[slot=item-list]:border-none data-selected:bg-muted [a]:no-underline [a]:hover:bg-row-hover',
        className,
      ),
    ),
    ...attributes,
  ];
  return href === undefined ? h.div(itemAttributes, children) : h.a([h.Href(href), ...itemAttributes], children);
};

export type MediaVariant = 'default' | 'icon';

const MEDIA_VARIANT_CLASS: Record<MediaVariant, string> = {
  default:
    'group-has-data-[slot=item-description]/item:min-h-lh group-has-data-[slot=item-description]/item:self-start group-has-data-[slot=item-description]/item:py-0.5',
  icon: "size-control-sm rounded-control-lg bg-muted text-muted-foreground group-has-data-[slot=item-description]/item:size-control-lg [&_svg:not([class*='size-'])]:size-icon",
};

export type MediaConfig<Message> = PartConfig<Message> &
  Readonly<{
    variant?: MediaVariant | undefined;
  }>;

const mediaPart = <Message>(
  { variant = 'default', className, attributes = [], children = [] }: MediaConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'item-media'),
      h.DataAttribute('variant', variant),
      h.Class(
        cn(
          'flex shrink-0 items-center justify-center gap-row-gap [&_svg]:pointer-events-none',
          MEDIA_VARIANT_CLASS[variant],
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const media = mediaPart;

export const content = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'item-content'),
      h.Class(cn('flex min-w-0 flex-1 flex-col gap-tight [&+[data-slot=item-content]]:flex-none', className)),
      ...attributes,
    ],
    children,
  );

export const title = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'item-title'),
      h.Class(
        cn(
          'block w-fit max-w-full min-w-0 truncate text-body font-medium underline-offset-4',
          'has-[>*]:flex has-[>*]:items-center has-[>*]:gap-row-gap has-[>*]:*:shrink-0 has-[>*]:[&>span:not([data-slot])]:shrink has-[>*]:[&>span:not([data-slot])]:truncate',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const description = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.p(
    [
      h.DataAttribute('slot', 'item-description'),
      h.Class(
        cn(
          'line-clamp-2 text-left text-body font-normal text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const actions = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'item-actions'), h.Class(cn('flex items-center gap-related', className)), ...attributes],
    children,
  );

export const chevron = (className?: string): Html =>
  icon('chevron-right', {
    dataSlot: 'item-chevron',
    className: cn(
      'size-icon shrink-0 text-faint-foreground transition-[color,translate] duration-feedback',
      'group-hover/item:text-muted-foreground group-focus-visible/item:text-muted-foreground',
      'motion-safe:group-hover/item:translate-x-0.5 motion-safe:group-focus-visible/item:translate-x-0.5',
      className,
    ),
  });

export const header = <Message>(
  { className, attributes = [], children = [] }: PartConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'item-header'),
      h.Class(cn('flex basis-full items-center justify-between gap-related', className)),
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
      h.DataAttribute('slot', 'item-footer'),
      h.Class(cn('flex basis-full items-center justify-between gap-related', className)),
      ...attributes,
    ],
    children,
  );

export const { Model: VirtualListModel, Message: VirtualListMessage, update: updateVirtualList } = VirtualList;
export type VirtualListModel = VirtualList.Model;
export type VirtualListMessage = VirtualList.Message;

export type VirtualListInitConfig = Readonly<{
  id: string;
  estimatedItemSize?: number;
}>;

const DEFAULT_ESTIMATED_ITEM_SIZE = 72;

export const initVirtualList = ({
  id,
  estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE,
}: VirtualListInitConfig): VirtualListModel => VirtualList.init({ id, rowHeightPx: estimatedItemSize });

const LOAD_MORE_DISTANCE = 500;

export const isNearEnd = (message: VirtualListMessage): boolean =>
  message._tag === 'ObservedContainerScroll' &&
  message.scrollHeight - message.scrollTop - message.containerHeight <= LOAD_MORE_DISTANCE;

const DEFAULT_LOADING_LABEL = 'Loading more';

type VirtualRow<Item> = Readonly<{ _tag: 'Row'; item: Item; index: number }> | Readonly<{ _tag: 'Loader' }>;

export type VirtualListConfig<Item, ParentMessage> = Readonly<{
  model: VirtualListModel;
  toParentMessage: (message: VirtualListMessage) => ParentMessage;
  items: ReadonlyArray<Item>;
  itemKey: (item: Item) => string;
  itemToView: (item: Item, index: number) => Html;
  isLoadingMore?: boolean | undefined;
  loadingLabel?: string | undefined;
  className?: string | undefined;
}>;

export const virtualList = <Item, ParentMessage>(
  config: VirtualListConfig<Item, ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const {
    model,
    toParentMessage,
    items,
    itemKey,
    itemToView,
    isLoadingMore = false,
    loadingLabel = DEFAULT_LOADING_LABEL,
    className,
  } = config;

  const rows: ReadonlyArray<VirtualRow<Item>> = [
    ...items.map((item, index): VirtualRow<Item> => ({ _tag: 'Row', item, index })),
    ...(isLoadingMore ? [{ _tag: 'Loader' } as const] : []),
  ];

  const loader = (): Html =>
    h.div(
      [h.Role('status'), h.Class('flex justify-center py-group')],
      [Spinner.view({ className: 'text-muted-foreground', size: 20 }), h.span([h.Class('sr-only')], [loadingLabel])],
    );

  const rowToView = (row: VirtualRow<Item>): Html =>
    row._tag === 'Loader'
      ? loader()
      : h.div(
          [h.DataAttribute('slot', 'item-list-row'), h.Class(rowClassName(row.index === items.length - 1))],
          [itemToView(row.item, row.index)],
        );

  return h.submodel({
    slotId: model.id,
    model,
    view: VirtualList.view<VirtualRow<Item>>(),
    viewInputs: {
      items: rows,
      itemToKey: (row) => (row._tag === 'Loader' ? `${model.id}-loader` : itemKey(row.item)),
      itemToView: rowToView,
      dynamicRowHeights: true,
      rowElement: 'li',
      containerClassName: cn(
        'overflow-y-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:ring-inset',
        className,
      ),
      containerAttributes: childAttributes([h.DataAttribute('slot', 'item-list'), h.Tabindex(0)]),
    },
    toParentMessage,
  });
};
