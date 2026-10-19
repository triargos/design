import type { Meta, StoryObj } from '@storybook/react-vite';

import { BulkSelectionDefault } from '../examples/patterns/bulk-selection/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Patterns/Bulk Selection',
  parameters: { description: 'Select rows, act on all of them.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Bulk Selection'
      description='Select rows, act on all of them: a checkbox column with select-all in a card table, and a Bottom Float Menu with the count, clear and the actions while anything is selected.'>
      <ExampleSection title='Default' bare>
        <BulkSelectionDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <BulkSelectionDefault /> };
