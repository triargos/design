import type { Meta, StoryObj } from '@storybook/react-vite';

import { VirtualizedListDefault } from '../examples/virtualized-list/default';
import { VirtualizedListLoadingMore } from '../examples/virtualized-list/loading-more';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Virtualized List',
  parameters: { description: 'A long list that renders only the rows in view.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Virtualized List'
      description='A long list that renders only the rows in view, measured as they mount, and loads the next page near the end. It scrolls itself: give it a height.'>
      <ExampleSection title='Default' description='1,000 rows, hairlines between them as in ItemList.' bare>
        <VirtualizedListDefault />
      </ExampleSection>
      <ExampleSection
        title='Loading more'
        description={
          <>
            <Code>hasMore</Code> + <Code>onLoadMore</Code>; <Code>isLoadingMore</Code> shows the loader. Scroll down.
          </>
        }
        bare>
        <VirtualizedListLoadingMore />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <VirtualizedListDefault /> };
export const LoadingMore: Story = {
  name: 'Loading more',
  render: () => <VirtualizedListLoadingMore />,
};
