import type { Meta, StoryObj } from '@storybook/react-vite';

import { SortableDefault } from '../examples/sortable/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Sortable',
  parameters: { description: 'Rows a person puts in order themselves.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage title='Sortable' description='Rows a person puts in order themselves.'>
      <ExampleSection
        title='Default'
        description='Drag a row by its handle, or Tab to it, Space to lift, arrows to move, Space to drop.'
        bare>
        <SortableDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <SortableDefault /> };
