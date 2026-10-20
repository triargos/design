import type { Meta, StoryObj } from '@storybook/react-vite';

import { TimelineDefault } from '../examples/timeline/default';
import { TimelineHorizontal } from '../examples/timeline/horizontal';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Timeline',
  parameters: { description: 'Events in order, with what happened when.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage title='Timeline' description='Events in order, with what happened when.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>value={'{3}'}</Code>: three steps reached.
          </>
        }>
        <TimelineDefault />
      </ExampleSection>
      <ExampleSection title='Horizontal'>
        <TimelineHorizontal />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <TimelineDefault /> };
export const Horizontal: Story = { render: () => <TimelineHorizontal /> };
