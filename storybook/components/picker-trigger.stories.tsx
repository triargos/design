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
      description='A button that looks like a field, for a picker that opens a popup. It lines up with Input and SelectTrigger; pass it as a trigger’s render element.'>
      <ExampleSection title='Default' description='The value in a span, so a long one truncates; the icon at the end.'>
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
