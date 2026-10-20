import type { Meta, StoryObj } from '@storybook/react-vite';

import { TimeInputDefault } from '../examples/time-input/default';
import { TimeInputStates } from '../examples/time-input/states';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Time Input',
  parameters: { description: 'A time of day, typed into segments.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Time Input'
      description='A time of day typed into segments at input height. The value is a 24-hour HH:mm string, empty is the empty string; the segments follow the locale’s clock.'>
      <ExampleSection title='Default'>
        <TimeInputDefault />
      </ExampleSection>
      <ExampleSection title='States' description='Empty, invalid, disabled.'>
        <TimeInputStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <TimeInputDefault /> };
export const States: Story = { render: () => <TimeInputStates /> };
