import { Array, Effect, Number, Option, Queue, Schema, Stream, pipe } from 'effect';
import { Mount } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { cn } from './cn.ts';

export type Series = Readonly<{ key: string; label: string; color: string }>;

export type Datum = Readonly<{ label: string; values: Readonly<Record<string, number>> }>;

const Size = Schema.Struct({ width: Schema.Number, height: Schema.Number });
type Size = typeof Size.Type;

export const Model = Schema.Struct({
  id: Schema.String,
  maybeSize: Schema.Option(Size),
  maybeActiveIndex: Schema.Option(Schema.Number),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  MeasuredPlot: { size: Size },
  HoveredCategory: { index: Schema.Number },
  LeftPlot: {},
});
export type Message = typeof Message.Type;

export const init = ({ id }: Readonly<{ id: string }>): Model => ({
  id,
  maybeSize: Option.none(),
  maybeActiveIndex: Option.none(),
});

export const update = (model: Model, message: Message) =>
  Message.match(message, {
    MeasuredPlot: ({ size }) => ({ model: modifyFields(model, { maybeSize: () => Option.some(size) }) }),
    HoveredCategory: ({ index }) => ({ model: modifyFields(model, { maybeActiveIndex: () => Option.some(index) }) }),
    LeftPlot: () => ({ model: modifyFields(model, { maybeActiveIndex: () => Option.none() }) }),
  });

type MeasuredPlot = typeof Message.MeasuredPlot.Type;

const observePlotSize = (element: Element): Stream.Stream<MeasuredPlot> =>
  Stream.callback<MeasuredPlot>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const emit = () =>
          Queue.offerUnsafe(
            queue,
            Message.MeasuredPlot({ size: { width: element.clientWidth, height: element.clientHeight } }),
          );
        const resizeObserver = new ResizeObserver(emit);
        resizeObserver.observe(element);
        emit();
        return () => resizeObserver.disconnect();
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.flatMap(() => Effect.never)),
  );

export const ObservePlotSize = Mount.defineStream('ObservePlotSize', {
  args: { id: Schema.String },
  messages: [Message.MeasuredPlot],
  execute: ({ element }) => observePlotSize(element),
});

type Margin = Readonly<{ top: number; right: number; bottom: number; left: number }>;

const BAR_MARGIN: Margin = { top: 5, right: 5, bottom: 5, left: 5 };
const LINE_MARGIN: Margin = { top: 0, right: 12, bottom: 0, left: 12 };
const X_AXIS_HEIGHT = 30;
const TICK_MARGIN = 8;
const TICK_COUNT = 5;
const BAR_CATEGORY_GAP = 0.1;
const BAR_RADIUS = 4;
const ACTIVE_DOT_RADIUS = 4;
const TOOLTIP_OFFSET = 10;
const DEFAULT_LOCALE = 'en-US';

const niceTicks = (maximum: number): ReadonlyArray<number> => {
  const roughStep = maximum / (TICK_COUNT - 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = (Math.ceil((roughStep / magnitude) * 2) / 2) * magnitude;
  return Array.makeBy(TICK_COUNT, (index) => index * step);
};

const valueOf = (datum: Datum, key: string): number => datum.values[key] ?? 0;

type Plot = Readonly<{
  size: Size;
  margin: Margin;
  bottom: number;
  ticks: ReadonlyArray<number>;
  domainMaximum: number;
}>;

const plotOf = (size: Size, margin: Margin, maximum: number): Plot => {
  const ticks = niceTicks(maximum);
  return {
    size,
    margin,
    bottom: size.height - X_AXIS_HEIGHT,
    ticks,
    domainMaximum: Option.getOrElse(Array.last(ticks), () => maximum),
  };
};

const yOf = (plot: Plot, value: number): number =>
  plot.bottom - ((plot.bottom - plot.margin.top) * value) / plot.domainMaximum;

const plotWidth = (plot: Plot): number => plot.size.width - plot.margin.left - plot.margin.right;

const grid = <Message>(plot: Plot, h: HtmlBuilder<Message>): Html =>
  h.g(
    [h.Class('stroke-border/50')],
    Array.map(plot.ticks, (tick) =>
      h.line([
        h.Attribute('x1', String(plot.margin.left)),
        h.Attribute('x2', String(plot.size.width - plot.margin.right)),
        h.Attribute('y1', String(yOf(plot, tick))),
        h.Attribute('y2', String(yOf(plot, tick))),
      ]),
    ),
  );

const xAxis = <Message>(
  plot: Plot,
  data: ReadonlyArray<Datum>,
  xOfIndex: (index: number) => number,
  h: HtmlBuilder<Message>,
): Html =>
  h.g(
    [h.Class('fill-muted-foreground')],
    Array.map(data, (datum, index) =>
      h.text(
        [
          h.Attribute('x', String(xOfIndex(index))),
          h.Attribute('y', String(plot.bottom + TICK_MARGIN)),
          h.Attribute('dy', '0.71em'),
          h.Attribute('text-anchor', 'middle'),
        ],
        [datum.label],
      ),
    ),
  );

const topRoundedBar = (x: number, y: number, width: number, height: number): string => {
  const radius = Math.min(BAR_RADIUS, height, width / 2);
  return [
    `M ${x},${y + height}`,
    `V ${y + radius}`,
    `Q ${x},${y} ${x + radius},${y}`,
    `H ${x + width - radius}`,
    `Q ${x + width},${y} ${x + width},${y + radius}`,
    `V ${y + height}`,
    'Z',
  ].join(' ');
};

const monotoneTangents = (points: ReadonlyArray<readonly [number, number]>): ReadonlyArray<number> => {
  const slopes = Array.makeBy(points.length - 1, (index) => {
    const [x0, y0] = points[index] ?? [0, 0];
    const [x1, y1] = points[index + 1] ?? [0, 0];
    return (y1 - y0) / (x1 - x0);
  });
  return Array.makeBy(points.length, (index) => {
    const previous = slopes[index - 1];
    const next = slopes[index];
    if (previous === undefined) {
      return next ?? 0;
    } else if (next === undefined) {
      return previous;
    } else if (previous * next <= 0) {
      return 0;
    } else {
      return (2 * previous * next) / (previous + next);
    }
  });
};

const monotonePath = (points: ReadonlyArray<readonly [number, number]>): string => {
  const tangents = monotoneTangents(points);
  return pipe(
    points,
    Array.map(([x, y], index) => {
      if (index === 0) {
        return `M${x},${y}`;
      }
      const [x0, y0] = points[index - 1] ?? [x, y];
      const third = (x - x0) / 3;
      const startTangent = tangents[index - 1] ?? 0;
      const endTangent = tangents[index] ?? 0;
      return `C${x0 + third},${y0 + third * startTangent},${x - third},${y - third * endTangent},${x},${y}`;
    }),
    Array.join(''),
  );
};

export type ContainerConfig = Readonly<{
  series: ReadonlyArray<Series>;
  className?: string | undefined;
  children: ReadonlyArray<Html>;
}>;

export const container = <Message>({ series, className, children }: ContainerConfig, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'chart'),
      h.Style(Object.fromEntries(Array.map(series, ({ key, color }) => [`--color-${key}`, color]))),
      h.Class(cn('relative flex aspect-video flex-col justify-center text-caption', className)),
    ],
    children,
  );

export type TooltipConfig = Readonly<{
  title: string;
  series: ReadonlyArray<Series>;
  datum: Datum;
  locale?: string | undefined;
  className?: string | undefined;
}>;

export const tooltip = <Message>(
  { title, series, datum, locale = DEFAULT_LOCALE, className }: TooltipConfig,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'chart-tooltip'),
      h.Class(
        cn(
          'grid min-w-32 items-start gap-(--chart-tooltip-pad-y) rounded-tooltip bg-popover px-(--chart-tooltip-pad-x) py-(--chart-tooltip-pad-y) text-caption text-popover-foreground shadow-popup',
          className,
        ),
      ),
    ],
    [
      h.div([h.Class('font-medium')], [title]),
      h.div(
        [h.Class('grid gap-(--chart-tooltip-pad-y)')],
        Array.map(series, ({ key, label, color }) =>
          h.div(
            [h.Key(key), h.Class('flex w-full items-center gap-row-gap')],
            [
              h.div([h.Class('size-2 shrink-0 rounded-full bg-(--color-bg)'), h.Style({ '--color-bg': color })]),
              h.div(
                [h.Class('flex flex-1 items-center justify-between gap-group leading-none')],
                [
                  h.span([h.Class('text-muted-foreground')], [label]),
                  h.span(
                    [h.Class('font-mono font-medium text-foreground tabular-nums')],
                    [valueOf(datum, key).toLocaleString(locale)],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ],
  );

export const legend = <Message>(
  { series, className }: Readonly<{ series: ReadonlyArray<Series>; className?: string | undefined }>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'chart-legend'),
      h.Class(cn('flex items-center justify-center gap-group pt-part', className)),
    ],
    Array.map(series, ({ key, label, color }) =>
      h.div(
        [h.Key(key), h.Class('flex items-center gap-control-gap')],
        [h.div([h.Class('size-2 shrink-0 rounded-full'), h.Style({ 'background-color': color })]), label],
      ),
    ),
  );

export type ChartConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  series: ReadonlyArray<Series>;
  data: ReadonlyArray<Datum>;
  ariaLabel: string;
  locale?: string | undefined;
  className?: string | undefined;
}>;

type Layer = Readonly<{
  plot: Plot;
  xOfIndex: (index: number) => number;
  categoryWidth: number;
  marks: ReadonlyArray<Html>;
  cursor: (index: number) => ReadonlyArray<Html>;
}>;

const plotSurface = <ParentMessage>(
  config: ChartConfig<ParentMessage>,
  margin: Margin,
  toLayer: (size: Size) => Layer,
  h: HtmlBuilder<ParentMessage>,
): Html => {
  const { model, toParentMessage, series, data, ariaLabel, locale, className } = config;

  const surface = (size: Size): ReadonlyArray<Html> => {
    const { plot, xOfIndex, categoryWidth, marks, cursor } = toLayer(size);
    const maybeActive = Option.flatMap(model.maybeActiveIndex, (index) =>
      Option.map(Array.get(data, index), (datum) => ({ index, datum })),
    );
    const hitAreas = Array.map(data, (datum, index) =>
      h.div([
        h.Key(datum.label),
        h.OnMouseEnter(toParentMessage(Message.HoveredCategory({ index }))),
        h.Class('absolute top-0'),
        h.Style({
          left: `${xOfIndex(index) - categoryWidth / 2}px`,
          width: `${categoryWidth}px`,
          height: `${plot.bottom}px`,
        }),
      ]),
    );
    const tooltipView = Option.match(maybeActive, {
      onNone: () => [],
      onSome: ({ index, datum }) => {
        const anchor = xOfIndex(index);
        const isLeftHalf = anchor < size.width / 2;
        return [
          h.div(
            [
              h.Class('pointer-events-none absolute top-[5px] z-10'),
              h.Style(
                isLeftHalf
                  ? { left: `${anchor + TOOLTIP_OFFSET}px` }
                  : { right: `${size.width - anchor + TOOLTIP_OFFSET}px` },
              ),
            ],
            [tooltip({ title: datum.label, series, datum, locale }, h)],
          ),
        ];
      },
    });

    return [
      h.svg(
        [
          h.Role('img'),
          h.AriaLabel(ariaLabel),
          h.Attribute('width', String(size.width)),
          h.Attribute('height', String(size.height)),
          h.Class('absolute inset-0 overflow-visible outline-hidden'),
        ],
        [
          grid(plot, h),
          ...Option.match(model.maybeActiveIndex, { onNone: () => [], onSome: cursor }),
          ...marks,
          xAxis(plot, data, xOfIndex, h),
        ],
      ),
      ...hitAreas,
      ...tooltipView,
    ];
  };

  return container(
    {
      series,
      className,
      children: [
        h.div(
          [
            h.Class('relative min-h-0 flex-1'),
            h.OnMount(Mount.mapMessage(ObservePlotSize({ id: model.id }), toParentMessage)),
            h.OnMouseLeave(toParentMessage(Message.LeftPlot())),
          ],
          Option.match(model.maybeSize, { onNone: () => [], onSome: surface }),
        ),
        h.div([h.Style({ 'padding-bottom': `${margin.bottom}px` })], [legend({ series }, h)]),
      ],
    },
    h,
  );
};

export const barChart = <ParentMessage>(config: ChartConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { series, data } = config;
  const lastSeriesKey = Option.map(Array.last(series), ({ key }) => key);
  const stackTotals = Array.map(data, (datum) => Number.sumAll(Array.map(series, ({ key }) => valueOf(datum, key))));
  const maximum = Array.reduce(stackTotals, 1, (largest, total) => Math.max(largest, total));

  return plotSurface(
    config,
    BAR_MARGIN,
    (size) => {
      const plot = plotOf(size, BAR_MARGIN, maximum);
      const categoryWidth = plotWidth(plot) / Math.max(data.length, 1);
      const barWidth = categoryWidth * (1 - 2 * BAR_CATEGORY_GAP);
      const xOfIndex = (index: number): number => plot.margin.left + categoryWidth * (index + 0.5);

      const stack = (datum: Datum, index: number): ReadonlyArray<Html> => {
        const x = xOfIndex(index) - barWidth / 2;
        const starts = Array.scan(series, 0, (total, { key }) => total + valueOf(datum, key));
        return Array.map(series, ({ key }, seriesIndex) => {
          const start = starts[seriesIndex] ?? 0;
          const end = start + valueOf(datum, key);
          const y = yOf(plot, end);
          const height = yOf(plot, start) - y;
          const isTop = Option.contains(lastSeriesKey, key);
          return h.path([
            h.Key(`${datum.label}-${key}`),
            h.Attribute('fill', `var(--color-${key})`),
            h.Attribute(
              'd',
              isTop ? topRoundedBar(x, y, barWidth, height) : `M ${x},${y} h ${barWidth} v ${height} h ${-barWidth} Z`,
            ),
          ]);
        });
      };

      return {
        plot,
        xOfIndex,
        categoryWidth,
        marks: [h.g([], Array.flatMap(data, stack))],
        cursor: (index) => [
          h.rect([
            h.Class('fill-muted'),
            h.Attribute('x', String(plot.margin.left + categoryWidth * index)),
            h.Attribute('y', String(plot.margin.top)),
            h.Attribute('width', String(categoryWidth)),
            h.Attribute('height', String(plot.bottom - plot.margin.top)),
          ]),
        ],
      };
    },
    h,
  );
};

export const lineChart = <ParentMessage>(config: ChartConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, series, data } = config;
  const allValues = Array.flatMap(data, (datum) => Array.map(series, ({ key }) => valueOf(datum, key)));
  const maximum = Array.reduce(allValues, 1, (largest, value) => Math.max(largest, value));

  return plotSurface(
    config,
    LINE_MARGIN,
    (size) => {
      const plot = plotOf(size, LINE_MARGIN, maximum);
      const step = plotWidth(plot) / Math.max(data.length - 1, 1);
      const xOfIndex = (index: number): number => plot.margin.left + step * index;
      const pointsOf = (key: string): ReadonlyArray<readonly [number, number]> =>
        Array.map(data, (datum, index): readonly [number, number] => [xOfIndex(index), yOf(plot, valueOf(datum, key))]);

      const lines = Array.map(series, ({ key }) =>
        h.path([
          h.Key(key),
          h.Attribute('fill', 'none'),
          h.Attribute('stroke', `var(--color-${key})`),
          h.Attribute('stroke-width', '2'),
          h.Attribute('d', monotonePath(pointsOf(key))),
        ]),
      );

      const activeDots = Option.match(model.maybeActiveIndex, {
        onNone: () => [],
        onSome: (index) =>
          Array.flatMap(series, ({ key }) =>
            Option.match(Array.get(data, index), {
              onNone: () => [],
              onSome: (datum) => [
                h.circle([
                  h.Key(`dot-${key}`),
                  h.Attribute('cx', String(xOfIndex(index))),
                  h.Attribute('cy', String(yOf(plot, valueOf(datum, key)))),
                  h.Attribute('r', String(ACTIVE_DOT_RADIUS)),
                  h.Attribute('fill', `var(--color-${key})`),
                ]),
              ],
            }),
          ),
      });

      return { plot, xOfIndex, categoryWidth: step, marks: [...lines, ...activeDots], cursor: () => [] };
    },
    h,
  );
};
