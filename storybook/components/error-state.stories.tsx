import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorStateDefault } from '../examples/error-state/default';
import { ErrorStateInACard } from '../examples/error-state/in-a-card';
import { ErrorStateSection } from '../examples/error-state/section';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Error State',
  parameters: { description: 'What failed and what to do next, in place of the content.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Error State'
      description='What failed and what to do next, in place of the content. page reads like the page it replaces, left-aligned; section sits centered inside a card.'>
      <ExampleSection title='Default' description='Page size, on the page.'>
        <ErrorStateDefault />
      </ExampleSection>
      <ExampleSection title='In a card' description='Page size inside a card.' bare>
        <ErrorStateInACard />
      </ExampleSection>
      <ExampleSection
        title='Section'
        description={
          <>
            <Code>size='section'</Code>: centered, for a part of the page that failed.
          </>
        }
        bare>
        <ErrorStateSection />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ErrorStateDefault /> };
export const InACard: Story = {
  name: 'In a card',
  render: () => <ErrorStateInACard />,
};
export const Section: Story = { render: () => <ErrorStateSection /> };
