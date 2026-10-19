import type { Meta, StoryObj } from '@storybook/react-vite';

import { UnsavedChangesIndicatorDefault } from '../examples/unsaved-changes-indicator/default';
import { UnsavedChangesIndicatorInACard } from '../examples/unsaved-changes-indicator/in-a-card';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Unsaved Changes Indicator',
  parameters: { description: 'Says there are unsaved changes, next to the save action.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Unsaved Changes Indicator'
      description='Says there are unsaved changes, next to the save action. It slides in on its own; in a card footer, which animates its own reveal, it does not.'>
      <ExampleSection title='Default' description='Click the button to toggle.'>
        <UnsavedChangesIndicatorDefault />
      </ExampleSection>
      <ExampleSection
        title='In a card'
        description={
          <>
            <Code>animated={'{false}'}</Code> inside InsetCardFooter.
          </>
        }
        bare>
        <UnsavedChangesIndicatorInACard />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <UnsavedChangesIndicatorDefault /> };
export const InACard: Story = {
  name: 'In a card',
  render: () => <UnsavedChangesIndicatorInACard />,
};
