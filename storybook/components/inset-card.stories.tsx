import type { Meta, StoryObj } from '@storybook/react-vite';

import { InsetCardDefault } from '../examples/inset-card/default';
import { InsetCardDestructive } from '../examples/inset-card/destructive';
import { InsetCardEmpty } from '../examples/inset-card/empty';
import { InsetCardNoHeader } from '../examples/inset-card/no-header';
import { InsetCardStacked } from '../examples/inset-card/stacked';
import { InsetCardWithActions } from '../examples/inset-card/with-actions';
import { InsetCardWithDescription } from '../examples/inset-card/with-description';
import { InsetCardWithFooter } from '../examples/inset-card/with-footer';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Inset Card',
  parameters: { description: 'The content block: a shell around a card.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Inset Card'
      description='The content block. A shell (label strip, footer) around a card (content). Every block on a page is one.'>
      <ExampleSection title='Default' description='The header is a one-line label strip on the shell.' bare>
        <InsetCardDefault />
      </ExampleSection>
      <ExampleSection
        title='With description'
        description='One sentence; long copy makes the shell read as a gray block.'
        bare>
        <InsetCardWithDescription />
      </ExampleSection>
      <ExampleSection
        title='With actions'
        description='Header actions take xs / icon-xs buttons and end on the column of the row actions. A flush ItemList: InsetCardContent with overflow-hidden.'
        bare>
        <InsetCardWithActions />
      </ExampleSection>
      <ExampleSection title='No header' description='Content alone; the shell shows as a 4px rim.' bare>
        <InsetCardNoHeader />
      </ExampleSection>
      <ExampleSection
        title='With footer'
        description={
          <>
            <Code>InsetCardFooter show</Code> while the form is dirty; type to show it again.
          </>
        }
        bare>
        <InsetCardWithFooter />
      </ExampleSection>
      <ExampleSection title='Stacked' description='Peer cards sit one group step apart, in a stack or in columns.' bare>
        <InsetCardStacked />
      </ExampleSection>
      <ExampleSection
        title='Destructive'
        description={
          <>
            <Code>tone='destructive'</Code> marks only the title. The action row stacks below sm, the button full width.
          </>
        }
        bare>
        <InsetCardDestructive />
      </ExampleSection>
      <ExampleSection
        title='Empty'
        description={
          <>
            <Code>EmptyState size='sm'</Code> in the content.
          </>
        }
        bare>
        <InsetCardEmpty />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <InsetCardDefault /> };
export const WithDescription: Story = {
  name: 'With description',
  render: () => <InsetCardWithDescription />,
};
export const WithActions: Story = {
  name: 'With actions',
  render: () => <InsetCardWithActions />,
};
export const NoHeader: Story = {
  name: 'No header',
  render: () => <InsetCardNoHeader />,
};
export const WithFooter: Story = {
  name: 'With footer',
  render: () => <InsetCardWithFooter />,
};
export const Stacked: Story = { render: () => <InsetCardStacked /> };
export const Destructive: Story = { render: () => <InsetCardDestructive /> };
export const Empty: Story = { render: () => <InsetCardEmpty /> };
