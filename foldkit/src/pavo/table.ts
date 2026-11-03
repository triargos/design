import { Array, Effect, Number, Option, Queue, Schema, Stream } from 'effect';
import { Mount } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';
import { cva } from 'class-variance-authority';

import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Child, PartAttribute, PartConfig } from './part.ts';
import * as Spinner from './spinner.ts';

export type TableVariant = 'default' | 'flush' | 'card';
export type TableSection = 'head' | 'body' | 'foot';
export type TableSort = 'asc' | 'desc' | 'none';

type VariantConfig = Readonly<{ variant?: TableVariant | undefined }>;

export type ViewConfig<Message> = PartConfig<Message> & VariantConfig;

export const view = <Message>(
  { variant = 'default', className, attributes = [], children = [] }: ViewConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'table-container'),
      h.DataAttribute('variant', variant),
      h.Class('relative w-full overflow-x-auto'),
    ],
    [
      h.table(
        [
          h.DataAttribute('slot', 'table'),
          h.Class(
            cn(
              'w-full caption-bottom text-control',
              variant === 'card' && 'border-separate border-spacing-0',
              className,
            ),
          ),
          ...attributes,
        ],
        children,
      ),
    ],
  );

export type HeaderConfig<Message> = PartConfig<Message> &
  VariantConfig &
  Readonly<{ isVirtualized?: boolean | undefined }>;

export const header = <Message>(
  { variant = 'default', isVirtualized = false, className, attributes = [], children = [] }: HeaderConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.thead(
    [
      h.DataAttribute('slot', 'table-header'),
      h.Class(cn(variant !== 'card' && !isVirtualized && '[&_tr]:border-b [&_tr]:border-border', className)),
      ...attributes,
    ],
    children,
  );

export const body = <Message>(
  { variant = 'default', className, attributes = [], children = [] }: PartConfig<Message> & VariantConfig,
  h: HtmlBuilder<Message>,
): Html =>
  h.tbody(
    [
      h.DataAttribute('slot', 'table-body'),
      ...(variant === 'card' ? [h.DataAttribute('surface', 'card')] : []),
      h.Class(cn(variant !== 'card' && '[&_tr:last-child]:border-0', className)),
      ...attributes,
    ],
    children,
  );

export const footer = <Message>(
  { variant = 'default', className, attributes = [], children = [] }: PartConfig<Message> & VariantConfig,
  h: HtmlBuilder<Message>,
): Html =>
  h.tfoot(
    [
      h.DataAttribute('slot', 'table-footer'),
      h.Class(
        cn('font-medium', variant !== 'card' && 'border-t border-border bg-muted/50 [&>tr]:last:border-b-0', className),
      ),
      ...attributes,
    ],
    children,
  );

export type RowConfig<Message> = PartConfig<Message> &
  VariantConfig &
  Readonly<{
    section?: TableSection | undefined;
    isSelected?: boolean | undefined;
    ariaRowIndex?: number | undefined;
  }>;

const rowClassName = (variant: TableVariant, section: TableSection, className: string | undefined): string =>
  cn(
    variant !== 'card' && 'border-b border-border-subtle transition-colors data-selected:bg-muted',
    variant !== 'card' && section === 'body' && 'hover:bg-row-hover',
    'has-data-[slot=table-row-link]:relative',
    '[&:has([data-slot=table-row-link])_:is(a,button,input,select,textarea,label):not([data-slot=table-row-link])]:relative',
    '[&:has([data-slot=table-row-link])_:is(a,button,input,select,textarea,label):not([data-slot=table-row-link])]:z-10',
    className,
  );

export const row = <Message>(
  {
    variant = 'default',
    section = 'body',
    isSelected = false,
    ariaRowIndex,
    className,
    attributes = [],
    children = [],
  }: RowConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.tr(
    [
      h.DataAttribute('slot', 'table-row'),
      ...(isSelected ? [h.DataAttribute('selected', '')] : []),
      ...(ariaRowIndex === undefined ? [] : [h.AriaRowindex(ariaRowIndex)]),
      h.Class(rowClassName(variant, section, className)),
      ...attributes,
    ],
    children,
  );

const tableCellEdges = cva(
  'has-[[role=checkbox]]:w-px first:has-[[role=checkbox]]:pe-0 last:has-[[role=checkbox]]:ps-0',
  {
    variants: {
      variant: {
        default: 'px-row-pad-x',
        flush: 'px-row-pad-x first:ps-card last:pe-card',
        card: 'px-row-pad-x first:ps-[calc(var(--spacing-card)+1px)] last:pe-[calc(var(--spacing-card)+1px)]',
      },
    },
  },
);

const ARIA_SORT: Record<TableSort, 'ascending' | 'descending' | 'none'> = {
  asc: 'ascending',
  desc: 'descending',
  none: 'none',
};

const STICKY_HEAD_FILL: Record<TableVariant, string> = {
  default: 'bg-background',
  flush: 'bg-card',
  card: 'bg-(--card-shell)',
};

export type HeadConfig<Message> = PartConfig<Message> &
  VariantConfig &
  Readonly<{
    isVirtualized?: boolean | undefined;
    sort?: TableSort | undefined;
    onSort?: Message | undefined;
  }>;

const sortButton = <Message>(
  sort: TableSort | undefined,
  onSort: Message,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<Message>,
): Html => {
  const isSorted = sort !== undefined && sort !== 'none';
  return h.button(
    [
      h.Type('button'),
      h.OnClick(onSort),
      h.Class(
        cn(
          'group/sort relative -mx-(--table-sort-pad-x) inline-flex items-center gap-control-gap-sm rounded-control-sm px-(--table-sort-pad-x) py-(--table-sort-pad-y) font-medium transition-colors duration-feedback outline-none hit-area hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
          isSorted && 'text-foreground',
        ),
      ),
    ],
    [
      ...children,
      isSorted
        ? icon('arrow-up', {
            className: cn(
              'size-icon-sm transition-transform duration-move ease-move motion-reduce:transition-none',
              sort === 'desc' && 'rotate-180',
            ),
          })
        : icon('arrows-sort', {
            className:
              'size-icon-sm opacity-0 transition-opacity duration-feedback group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100',
          }),
    ],
  );
};

export const head = <Message>(
  {
    variant = 'default',
    isVirtualized = false,
    sort,
    onSort,
    className,
    attributes = [],
    children = [],
  }: HeadConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.th(
    [
      h.DataAttribute('slot', 'table-head'),
      ...(sort === undefined || onSort === undefined ? [] : [h.AriaSort(ARIA_SORT[sort])]),
      h.Class(
        cn(
          tableCellEdges({ variant }),
          'h-(--table-head-height) text-left align-middle font-medium whitespace-nowrap text-muted-foreground',
          isVirtualized && ['sticky top-0 z-20', STICKY_HEAD_FILL[variant]],
          isVirtualized &&
            variant !== 'card' &&
            'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border',
          className,
        ),
      ),
      ...attributes,
    ],
    onSort === undefined ? children : [sortButton(sort, onSort, children, h)],
  );

const tableCellVariants = cva('py-row-pad-y align-middle', {
  variants: {
    variant: { default: '', flush: '', card: '' },
    section: { head: '', body: '', foot: '' },
  },
  compoundVariants: [
    {
      variant: 'card',
      section: 'body',
      className: [
        'bg-(--table-cell-fill) bg-clip-padding transition-colors [--table-cell-fill:var(--card)]',
        'shadow-[2px_0_0_-1px_var(--table-cell-fill)] last:shadow-none',
        'in-[tr:hover]:[--table-cell-fill:color-mix(in_oklch,var(--muted)_50%,var(--card))]',
        'in-[tr[data-selected]]:[--table-cell-fill:var(--muted)]',
        'border-b border-b-border-subtle in-[tr:last-child]:border-b-(--edge)',
        'in-[tr:first-child]:border-t in-[tr:first-child]:border-t-(--edge)',
        'first:border-s first:border-s-(--edge) first:ps-card last:border-e last:border-e-(--edge) last:pe-card',
        'in-[tr:first-child]:first:rounded-ss-inner in-[tr:first-child]:last:rounded-se-inner',
        'in-[tr:last-child]:first:rounded-es-inner in-[tr:last-child]:last:rounded-ee-inner',
      ],
    },
    { variant: 'card', section: 'foot', className: 'py-(--table-foot-pad-y)' },
  ],
});

export type CellConfig<Message> = PartConfig<Message> &
  VariantConfig &
  Readonly<{
    section?: TableSection | undefined;
    colSpan?: number | undefined;
  }>;

export const cell = <Message>(
  { variant = 'default', section = 'body', colSpan, className, attributes = [], children = [] }: CellConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.td(
    [
      h.DataAttribute('slot', 'table-cell'),
      ...(colSpan === undefined ? [] : [h.Colspan(colSpan)]),
      h.Class(cn(tableCellEdges({ variant }), tableCellVariants({ variant, section }), className)),
      ...attributes,
    ],
    children,
  );

const GROUP_BAND = 'flex h-(--table-group-height) items-center gap-related text-caption font-medium text-foreground';

export type GroupRowConfig<Message> = PartConfig<Message> &
  VariantConfig &
  Readonly<{
    colSpan: number;
    count?: number | undefined;
    isOpen?: boolean | undefined;
    onToggle?: Message | undefined;
  }>;

export const groupRow = <Message>(
  {
    variant = 'default',
    colSpan,
    count,
    isOpen = true,
    onToggle,
    className,
    attributes = [],
    children = [],
  }: GroupRowConfig<Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const content = [
    ...children,
    ...(count === undefined
      ? []
      : [
          h.span(
            [h.DataAttribute('slot', 'table-group-count'), h.Class('font-normal text-muted-foreground tabular-nums')],
            [String(count)],
          ),
        ]),
  ];

  const band =
    onToggle === undefined
      ? h.div([h.Class(GROUP_BAND)], content)
      : h.button(
          [
            h.Type('button'),
            h.AriaExpanded(isOpen),
            h.OnClick(onToggle),
            h.Class(
              cn(
                GROUP_BAND,
                'group/fold relative w-full rounded-control-xs text-left outline-none hit-area focus-visible:ring-3 focus-visible:ring-ring/24',
              ),
            ),
          ],
          [
            ...content,
            icon('chevron-down', {
              className: cn(
                'ms-auto size-icon-sm shrink-0 text-muted-foreground transition-[rotate,color] duration-move ease-move group-hover/fold:text-foreground motion-reduce:transition-none',
                !isOpen && '-rotate-90',
              ),
            }),
          ],
        );

  return h.tr(
    [
      h.DataAttribute('slot', 'table-group-row'),
      h.Class(rowClassName(variant, 'body', cn(variant !== 'card' && 'bg-muted/65 hover:bg-muted/65', className))),
      ...attributes,
    ],
    [
      cell(
        {
          variant,
          colSpan,
          className:
            'py-0 [--table-cell-fill:color-mix(in_oklch,var(--muted)_65%,var(--card))] in-[tr:hover]:[--table-cell-fill:color-mix(in_oklch,var(--muted)_65%,var(--card))]',
          children: [band],
        },
        h,
      ),
    ],
  );
};

export type RowLinkConfig<Message> = PartConfig<Message> & Readonly<{ href: string }>;

export const rowLink = <Message>(
  { href, className, attributes = [], children = [] }: RowLinkConfig<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  h.a(
    [
      h.Href(href),
      h.DataAttribute('slot', 'table-row-link'),
      h.Class(
        cn(
          'text-foreground no-underline outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/24 focus-visible:after:ring-inset',
          className,
        ),
      ),
      ...attributes,
    ],
    children,
  );

export const VirtualTableModel = Schema.Struct({
  id: Schema.String,
  scrollTop: Schema.Number,
  viewportHeight: Schema.Number,
  rowsOffset: Schema.Number,
});
export type VirtualTableModel = typeof VirtualTableModel.Type;

export const VirtualTableMessage = defineMessageUnion({
  ObservedScroll: { scrollTop: Schema.Number, viewportHeight: Schema.Number, rowsOffset: Schema.Number },
});
export type VirtualTableMessage = typeof VirtualTableMessage.Type;

export const initVirtualTable = ({ id }: Readonly<{ id: string }>): VirtualTableModel => ({
  id,
  scrollTop: 0,
  viewportHeight: 0,
  rowsOffset: 0,
});

export const updateVirtualTable = (model: VirtualTableModel, message: VirtualTableMessage) =>
  VirtualTableMessage.match(message, {
    ObservedScroll: ({ scrollTop, viewportHeight, rowsOffset }) => ({
      model: modifyFields(model, {
        scrollTop: () => scrollTop,
        viewportHeight: () => viewportHeight,
        rowsOffset: () => rowsOffset,
      }),
    }),
  });

const LOAD_MORE_DISTANCE = 500;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_LOADING_LABEL = 'Loading more';

const bodySelector = (id: string): string => `[data-virtual-table-body="${id}"]`;

const observedScroll = (element: HTMLElement, id: string): VirtualTableMessage => {
  const rowsStart = element.querySelector(bodySelector(id));
  const rowsOffset =
    rowsStart === null
      ? 0
      : rowsStart.getBoundingClientRect().top -
        element.getBoundingClientRect().top -
        element.clientTop +
        element.scrollTop;
  return VirtualTableMessage.ObservedScroll({
    scrollTop: element.scrollTop,
    viewportHeight: element.clientHeight,
    rowsOffset,
  });
};

const observeTableScroll = (element: Element, id: string): Stream.Stream<VirtualTableMessage> =>
  Stream.callback<VirtualTableMessage>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        if (!(element instanceof HTMLElement)) {
          return () => undefined;
        }

        const emit = () => Queue.offerUnsafe(queue, observedScroll(element, id));
        emit();
        element.addEventListener('scroll', emit, { passive: true });
        const resizeObserver = new ResizeObserver(emit);
        resizeObserver.observe(element);
        Array.forEach(Array.fromIterable(element.children), (child) => resizeObserver.observe(child));

        return () => {
          resizeObserver.disconnect();
          element.removeEventListener('scroll', emit);
        };
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.flatMap(() => Effect.never)),
  );

export const ObserveTableScroll = Mount.defineStream('ObserveTableScroll', {
  args: { id: Schema.String },
  messages: [VirtualTableMessage.ObservedScroll],
  execute: ({ element, id }) => observeTableScroll(element, id),
});

export const isNearEnd = (model: VirtualTableModel, itemCount: number, rowHeightPx: number): boolean =>
  model.viewportHeight > 0 &&
  model.rowsOffset + itemCount * rowHeightPx - (model.scrollTop + model.viewportHeight) <= LOAD_MORE_DISTANCE;

export const scrollElementAttributes = <ParentMessage>(
  model: VirtualTableModel,
  toParentMessage: (message: VirtualTableMessage) => ParentMessage,
  h: HtmlBuilder<ParentMessage>,
) => [h.OnMount(Mount.mapMessage(ObserveTableScroll({ id: model.id }), toParentMessage))];

type VisibleRows = Readonly<{ startIndex: number; endIndex: number }>;

const visibleRows = (
  model: VirtualTableModel,
  itemCount: number,
  rowHeightPx: number,
  overscan: number,
): VisibleRows => {
  const firstVisible = Math.floor(Math.max(0, model.scrollTop - model.rowsOffset) / rowHeightPx);
  const visibleCount = Math.ceil(model.viewportHeight / rowHeightPx) + 1;
  return {
    startIndex: Number.clamp(firstVisible - overscan, { minimum: 0, maximum: itemCount }),
    endIndex: Number.clamp(firstVisible + visibleCount + overscan, { minimum: 0, maximum: itemCount }),
  };
};

const spacer = <Message>(
  variant: TableVariant,
  edge: 'top' | 'bottom',
  height: number,
  columnCount: number,
  h: HtmlBuilder<Message>,
): Html =>
  h.tr(
    [h.AriaHidden(true), h.DataAttribute('slot', 'table-spacer')],
    [
      h.td([
        h.Colspan(columnCount),
        h.Style({ height: `${height}px` }),
        h.Class(
          cn(
            'p-0',
            variant === 'card' && 'border-x border-(--edge) bg-card bg-clip-padding',
            variant === 'card' && edge === 'top' && 'rounded-t-inner border-t',
            variant === 'card' && edge === 'bottom' && 'rounded-b-inner border-b',
          ),
        ),
      ]),
    ],
  );

export type VirtualRow<Message> = Readonly<{
  index: number;
  attributes: ReadonlyArray<PartAttribute<Message>>;
}>;

export type VirtualizedConfig<Item, ParentMessage> = Readonly<{
  model: VirtualTableModel;
  toParentMessage: (message: VirtualTableMessage) => ParentMessage;
  items: ReadonlyArray<Item>;
  itemKey: (item: Item) => string;
  itemToRow: (item: Item, row: VirtualRow<ParentMessage>) => Html;
  header?: Html | undefined;
  columnCount: number;
  rowHeightPx: number;
  variant?: TableVariant | undefined;
  hasScrollElement?: boolean | undefined;
  hasMore?: boolean | undefined;
  isLoadingMore?: boolean | undefined;
  loadingLabel?: string | undefined;
  overscan?: number | undefined;
  ariaLabel?: string | undefined;
  ariaRowCount?: number | undefined;
  className?: string | undefined;
}>;

export const virtualized = <Item, ParentMessage>(
  config: VirtualizedConfig<Item, ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const {
    model,
    toParentMessage,
    items,
    itemKey,
    itemToRow,
    header: maybeHeader,
    columnCount,
    rowHeightPx,
    variant = 'default',
    hasScrollElement = false,
    hasMore = false,
    isLoadingMore = false,
    loadingLabel = DEFAULT_LOADING_LABEL,
    overscan = DEFAULT_OVERSCAN,
    ariaLabel,
    ariaRowCount,
    className,
  } = config;

  const headerRows = maybeHeader === undefined ? 0 : 1;
  const { startIndex, endIndex } = visibleRows(model, items.length, rowHeightPx, overscan);
  const paddingTop = startIndex * rowHeightPx;
  const paddingBottom = (items.length - endIndex) * rowHeightPx;

  const renderedRows = Array.map(items.slice(startIndex, endIndex), (item, sliceIndex) => {
    const index = startIndex + sliceIndex;
    return itemToRow(item, {
      index,
      attributes: [
        h.Key(itemKey(item)),
        h.DataAttribute('index', String(index)),
        h.AriaRowindex(index + 1 + headerRows),
        h.Style({ height: `${rowHeightPx}px` }),
      ],
    });
  });

  return h.div(
    [
      h.DataAttribute('slot', 'table-container'),
      h.DataAttribute('variant', variant),
      ...(hasScrollElement
        ? []
        : [h.Tabindex(0), h.OnMount(Mount.mapMessage(ObserveTableScroll({ id: model.id }), toParentMessage))]),
      h.Class(
        cn(
          'relative w-full',
          hasScrollElement
            ? 'overflow-x-clip'
            : 'overflow-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/24 focus-visible:ring-inset',
          !hasScrollElement && variant === 'card' && 'rounded-inner',
          className,
        ),
      ),
    ],
    [
      h.table(
        [
          h.DataAttribute('slot', 'table'),
          ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
          h.AriaRowcount(ariaRowCount ?? (hasMore ? -1 : items.length + headerRows)),
          h.Class(
            cn(
              'w-full table-fixed caption-bottom text-control',
              variant === 'card' && 'border-separate border-spacing-0',
            ),
          ),
        ],
        [
          ...Option.toArray(Option.fromNullishOr(maybeHeader)),
          body(
            {
              variant,
              attributes: [h.DataAttribute('virtual-table-body', model.id)],
              children: [
                ...(paddingTop > 0 ? [spacer(variant, 'top', paddingTop, columnCount, h)] : []),
                ...renderedRows,
                ...(paddingBottom > 0 ? [spacer(variant, 'bottom', paddingBottom, columnCount, h)] : []),
              ],
            },
            h,
          ),
        ],
      ),
      ...(isLoadingMore
        ? [
            h.div(
              [h.Role('status'), h.Class('flex justify-center py-group')],
              [
                Spinner.view({ className: 'text-muted-foreground', size: 20 }),
                h.span([h.Class('sr-only')], [loadingLabel]),
              ],
            ),
          ]
        : []),
    ],
  );
};
