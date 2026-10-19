import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stat } from '~/components/ui/stat';

import { StatDefault } from '../examples/stat/default';
import { StatEndAligned } from '../examples/stat/end-aligned';
import { StatInACard } from '../examples/stat/in-a-card';
import { StatLabelFirst } from '../examples/stat/label-first';
import { StatWithASeriesDot } from '../examples/stat/with-a-series-dot';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Stat',
  parameters: { description: 'A number and what it counts.' },
  component: Stat,
} satisfies Meta<typeof Stat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Stat'
      description='A number and what it counts. The value takes the title role with tabular figures; the label is a muted caption. A number is emphasis on a role, never its own size.'>
      <ExampleSection title='Default'>
        <StatDefault />
      </ExampleSection>
      <ExampleSection title='Label first' description='Children render in reading order.'>
        <StatLabelFirst />
      </ExampleSection>
      <ExampleSection
        title='With a series dot'
        description={
          <>
            <Code>StatusDot</Code> in <Code>StatLabel</Code>
          </>
        }>
        <StatWithASeriesDot />
      </ExampleSection>
      <ExampleSection
        title='End-aligned'
        description={
          <>
            <Code>className='items-end'</Code>
          </>
        }>
        <StatEndAligned />
      </ExampleSection>
      <ExampleSection title='In a card' bare>
        <StatInACard />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <StatDefault /> };
export const LabelFirst: Story = {
  name: 'Label first',
  render: () => <StatLabelFirst />,
};
export const WithASeriesDot: Story = {
  name: 'With a series dot',
  render: () => <StatWithASeriesDot />,
};
export const EndAligned: Story = {
  name: 'End-aligned',
  render: () => <StatEndAligned />,
};
export const InACard: Story = {
  name: 'In a card',
  render: () => <StatInACard />,
};
