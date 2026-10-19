import type { Meta, StoryObj } from '@storybook/react-vite';

import { PickerTriggerDefault } from '../examples/picker-trigger/default';
import { PickerTriggerPlaceholder } from '../examples/picker-trigger/placeholder';
import { PickerTriggerStates } from '../examples/picker-trigger/states';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Picker Trigger',
  parameters: { description: 'A button that looks like a field, for a picker that opens a popup.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Picker Trigger'
      description='A button that looks like a field, for pickers that open a popup (the date picker). Same surface, height, padding and text as Input and SelectTrigger. Pass it as a trigger’s render element.'>
      <ExampleSection
        title='Default'
        description='Wrap the value in a span, so a long value truncates instead of pushing the icon out.'>
        <PickerTriggerDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder'>
        <PickerTriggerPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='States'
        description='Invalid and disabled. No read-only: a picker that cannot change is plain text.'>
        <PickerTriggerStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <PickerTriggerDefault /> };
export const Placeholder: Story = { render: () => <PickerTriggerPlaceholder /> };
export const States: Story = { render: () => <PickerTriggerStates /> };
