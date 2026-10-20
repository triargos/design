import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

const SERIES = [
  { key: 'engineering', label: 'Engineering', color: 'var(--chart-1)' },
  { key: 'design', label: 'Design', color: 'var(--chart-2)' },
  { key: 'marketing', label: 'Marketing', color: 'var(--chart-3)' },
  { key: 'sales', label: 'Sales', color: 'var(--chart-4)' },
  { key: 'support', label: 'Support', color: 'var(--chart-5)' },
] as const;

const config = Object.fromEntries(
  SERIES.map((series) => [series.key, { label: series.label, color: series.color }]),
) satisfies ChartConfig;

const DATA = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((month, index) => ({
  month,
  engineering: 120 + index * 18,
  design: 40 + index * 4,
  marketing: 12 + (index % 3) * 3,
  sales: 6 + (index % 2),
  support: 3 + index,
}));

/** Stacked bars, the tooltip on hover, a legend. */
export function ChartDefault() {
  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Tasks closed by team</CardTitle>
      </CardHeader>
      <CardContent className='p-card'>
        <ChartContainer config={config} className='aspect-auto h-64 w-full'>
          <BarChart data={DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {SERIES.map((series, index) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                stackId='tasks'
                fill={`var(--color-${series.key})`}
                radius={index === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
