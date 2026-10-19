import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

const SERIES = [
  { key: 'parents', label: 'Eltern', color: 'var(--chart-1)' },
  { key: 'teachers', label: 'Lehrkräfte', color: 'var(--chart-2)' },
  { key: 'office', label: 'Sekretariat', color: 'var(--chart-3)' },
  { key: 'admins', label: 'Leitung', color: 'var(--chart-4)' },
  { key: 'guests', label: 'Gäste', color: 'var(--chart-5)' },
] as const;

const config = Object.fromEntries(
  SERIES.map((series) => [series.key, { label: series.label, color: series.color }]),
) satisfies ChartConfig;

const DATA = ['Sep', 'Okt', 'Nov', 'Dez', 'Jan', 'Feb'].map((month, index) => ({
  month,
  parents: 120 + index * 18,
  teachers: 40 + index * 4,
  office: 12 + (index % 3) * 3,
  admins: 6 + (index % 2),
  guests: 3 + index,
}));

/** Stacked bars, the tooltip on hover, a legend. */
export function ChartDefault() {
  return (
    <InsetCard className='w-full max-w-2xl'>
      <InsetCardHeader>
        <InsetCardTitle>Aktive Mitglieder</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <ChartContainer config={config} className='aspect-auto h-64 w-full'>
          <BarChart data={DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {SERIES.map((series, index) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                stackId='members'
                fill={`var(--color-${series.key})`}
                radius={index === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </InsetCardContent>
    </InsetCard>
  );
}
