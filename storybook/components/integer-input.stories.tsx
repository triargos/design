import type { Meta, StoryObj } from '@storybook/react-vite';

import { IntegerInputDefault } from '../examples/integer-input/default';
import { IntegerInputDisabled } from '../examples/integer-input/disabled';
import { IntegerInputWithMax } from '../examples/integer-input/with-max';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Integer Input',
  parameters: { description: 'A whole number with steppers and a unit.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage title='Integer Input' description='A whole number between a minus and a plus, with a unit.'>
      <ExampleSection title='Default'>
        <IntegerInputDefault />
      </ExampleSection>
      <ExampleSection
        title='With max'
        description={
          <>
            <Code>max</Code> stops the stepper and clamps typed values; the minimum is always 0.
          </>
        }>
        <IntegerInputWithMax />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <IntegerInputDisabled />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <IntegerInputDefault /> };
export const WithMax: Story = {
  name: 'With max',
  render: () => <IntegerInputWithMax />,
};
export const Disabled: Story = { render: () => <IntegerInputDisabled /> };
