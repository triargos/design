import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartDefault } from '../examples/chart/default';
import { ChartLine } from '../examples/chart/line';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';

const meta = {
  title: 'Components/Chart',
  parameters: { description: 'Recharts in ChartContainer, in our type and popup surface.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SERIES = [
  { key: 'parents', label: 'Eltern', color: 'var(--chart-1)' },
  { key: 'teachers', label: 'Lehrkräfte', color: 'var(--chart-2)' },
  { key: 'office', label: 'Sekretariat', color: 'var(--chart-3)' },
  { key: 'admins', label: 'Leitung', color: 'var(--chart-4)' },
  { key: 'guests', label: 'Gäste', color: 'var(--chart-5)' },
] as const;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Chart'
      description='Recharts inside ChartContainer, which maps a config to --color-<key> and draws the tooltip and legend in our type and popup surface. Series colors are chart-1 … chart-5: static, not branded.'>
      <ExampleSection title='Default' description='Stacked bars, the tooltip on hover, a legend.' bare>
        <ChartDefault />
      </ExampleSection>
      <ExampleSection title='Line' bare>
        <ChartLine />
      </ExampleSection>

      <FoundationSection title='Series colors' description='chart-1 … chart-5: static, not branded.'>
        <SpecimenList>
          {SERIES.map((series, index) => (
            <SpecimenRow key={series.key} name={`chart-${index + 1}`} meta={<Code>{`var(--chart-${index + 1})`}</Code>}>
              <span className='flex items-center gap-related text-body'>
                <span className='size-3 rounded-full' style={{ background: series.color }} />
                {series.label}
              </span>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ChartDefault /> };
export const Line: Story = { render: () => <ChartLine /> };
