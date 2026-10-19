import type { Meta, StoryObj } from '@storybook/react-vite';

import { ListInCardDefault } from '../examples/patterns/list-in-card/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Patterns/List in Card',
  parameters: { description: 'Every list on a page: an ItemList flush in an Inset Card.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='List in Card'
      description='Every list on a page: InsetCardContent with overflow-hidden around an ItemList. The header holds the add action; each row ends in a status and a ghost menu, on one column with the header action.'>
      <ExampleSection title='Default' bare>
        <ListInCardDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ListInCardDefault /> };
