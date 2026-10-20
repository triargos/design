import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import type { LegendPayload, TooltipPayload, TooltipPayloadEntry } from 'recharts';

import { cn } from '~/lib/utils';

/** Per series key: its label for tooltip and legend, and its color, exposed as `--color-<key>`. */
export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartConfig() {
  const config = React.use(ChartContext);
  if (!config) throw new Error('ChartTooltipContent and ChartLegendContent need a <ChartContainer />');
  return config;
}

/** Recharts in our type; `config` names each series and sets `--color-<key>` for its fill or stroke. */
function ChartContainer({
  className,
  style,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) {
  const colors = Object.fromEntries(
    Object.entries(config).flatMap(([key, { color }]) => (color ? [[`--color-${key}`, color]] : [])),
  );
  return (
    <ChartContext value={config}>
      <div
        data-slot='chart'
        style={{ ...colors, ...style }}
        className={cn(
          "flex aspect-video justify-center text-caption [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}>
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

/**
 * The hovered point: its label, then one row per series with its color, name and value. Recharts passes `active`,
 * `payload` and `label`; `locale` formats the values (BCP 47, default `en-US`).
 */
function ChartTooltipContent({
  active,
  payload,
  label,
  locale = 'en-US',
  className,
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string | number;
  locale?: string;
  className?: string;
}) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;

  const title = typeof label === 'string' ? (config[label]?.label ?? label) : label;
  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-control-sm bg-popover px-2.5 py-1.5 text-caption text-popover-foreground shadow-popup',
        className,
      )}>
      {title !== undefined && title !== '' && <div className='font-medium'>{title}</div>}
      <div className='grid gap-1.5'>
        {payload
          .filter((item) => item.type !== 'none')
          .map((item, index) => {
            const series = seriesConfig(config, item, `${item.name ?? item.dataKey ?? 'value'}`);
            const color: unknown = item.payload?.fill ?? item.color;
            return (
              <div key={index} className='flex w-full items-center gap-2'>
                <div
                  className='size-2 shrink-0 rounded-full bg-(--color-bg)'
                  style={{ '--color-bg': color } as React.CSSProperties}
                />
                <div className='flex flex-1 items-center justify-between gap-4 leading-none'>
                  <span className='text-muted-foreground'>{series?.label ?? item.name}</span>
                  {item.value != null && (
                    <span className='font-mono font-medium text-foreground tabular-nums'>
                      {typeof item.value === 'number' ? item.value.toLocaleString(locale) : String(item.value)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

/** One color square and label per series. Recharts passes `payload` and `verticalAlign`. */
function ChartLegendContent({
  payload,
  verticalAlign = 'bottom',
  className,
}: {
  payload?: ReadonlyArray<LegendPayload>;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  className?: string;
}) {
  const config = useChartConfig();
  if (!payload?.length) return null;

  return (
    <div className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}>
      {payload
        .filter((item) => item.type !== 'none')
        .map((item, index) => (
          <div key={index} className='flex items-center gap-1.5'>
            <div className='size-2 shrink-0 rounded-full' style={{ backgroundColor: item.color }} />
            {
              seriesConfig(config, item, `${typeof item.dataKey === 'function' ? 'value' : (item.dataKey ?? 'value')}`)
                ?.label
            }
          </div>
        ))}
    </div>
  );
}

/** The series config for a tooltip or legend item: by the string at `key` on the item or its datum, else by `key`. */
function seriesConfig(config: ChartConfig, item: TooltipPayloadEntry | LegendPayload, key: string) {
  const datum: unknown = item.payload;
  const named = stringAt(item, key) ?? (typeof datum === 'object' && datum !== null ? stringAt(datum, key) : undefined);
  return named !== undefined && named in config ? config[named] : config[key];
}

function stringAt(object: object, key: string): string | undefined {
  const value: unknown = Reflect.get(object, key);
  return typeof value === 'string' ? value : undefined;
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent };
