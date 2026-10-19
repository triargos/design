import type { Meta, StoryObj } from '@storybook/react-vite';

import { Slider } from '~/components/ui/slider';

import { SliderDefault } from '../examples/slider/default';
import { SliderDisabled } from '../examples/slider/disabled';
import { SliderRange } from '../examples/slider/range';
import { SliderWithLabelAndValue } from '../examples/slider/with-label-and-value';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Slider',
  parameters: { description: 'A value on a continuous range.' },
  component: Slider,
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Slider'
      description='A value on a continuous range, where the exact number matters less than the feel: zoom, a threshold. A 4px muted track, the brand fill for the chosen part. Disabled dims the whole control, the one place opacity stays.'>
      <ExampleSection title='Default'>
        <SliderDefault />
      </ExampleSection>
      <ExampleSection
        title='Range'
        description={
          <>
            <Code>defaultValue={'{[20, 70]}'}</Code>
          </>
        }>
        <SliderRange />
      </ExampleSection>
      <ExampleSection
        title='With label and value'
        description='No SliderValue part yet: the field shows the controlled value.'>
        <SliderWithLabelAndValue />
      </ExampleSection>
      <ExampleSection title='Disabled' description='Dims the whole control: the one place opacity stays.'>
        <SliderDisabled />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <SliderDefault /> };
export const Range: Story = { render: () => <SliderRange /> };
export const WithLabelAndValue: Story = {
  name: 'With label and value',
  render: () => <SliderWithLabelAndValue />,
};
export const Disabled: Story = { render: () => <SliderDisabled /> };
