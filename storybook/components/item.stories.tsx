import type { Meta, StoryObj } from '@storybook/react-vite';

import { ItemDefault } from '../examples/item/default';
import { ItemHeaderAndFooter } from '../examples/item/header-and-footer';
import { ItemLink } from '../examples/item/link';
import { ItemSelected } from '../examples/item/selected';
import { ItemWithActions } from '../examples/item/with-actions';
import { ItemWithDescription } from '../examples/item/with-description';
import { ItemWithMedia } from '../examples/item/with-media';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Item',
  parameters: { description: 'A row in a list: media, title and description, actions.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage title='Item' description='A row in a list: media, title and description, actions.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>ItemContent · ItemTitle</Code> in an <Code>ItemList</Code>, in a card.
          </>
        }
        bare>
        <ItemDefault />
      </ExampleSection>
      <ExampleSection title='With description' bare>
        <ItemWithDescription />
      </ExampleSection>
      <ExampleSection
        title='With media'
        description={
          <>
            <Code>ItemMedia variant='icon'</Code>; an Avatar for people.
          </>
        }
        bare>
        <ItemWithMedia />
      </ExampleSection>
      <ExampleSection title='With actions' description='A status and a ghost menu button on the right.' bare>
        <ItemWithActions />
      </ExampleSection>
      <ExampleSection
        title='Header and footer'
        description={
          <>
            <Code>ItemHeader</Code> and <Code>ItemFooter</Code> span the full width.
          </>
        }
        bare>
        <ItemHeaderAndFooter />
      </ExampleSection>
      <ExampleSection
        title='Link'
        description={
          <>
            <Code>{'render={<a />}'}</Code>, or a router link: the row highlights on hover.
          </>
        }
        bare>
        <ItemLink />
      </ExampleSection>
      <ExampleSection
        title='Selected'
        description={
          <>
            A <Code>selected</Code> row takes a quiet fill.
          </>
        }
        bare>
        <ItemSelected />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ItemDefault /> };
export const WithDescription: Story = {
  name: 'With description',
  render: () => <ItemWithDescription />,
};
export const WithMedia: Story = {
  name: 'With media',
  render: () => <ItemWithMedia />,
};
export const WithActions: Story = {
  name: 'With actions',
  render: () => <ItemWithActions />,
};
export const HeaderAndFooter: Story = {
  name: 'Header and footer',
  render: () => <ItemHeaderAndFooter />,
};
export const Link: Story = { render: () => <ItemLink /> };
export const Selected: Story = { render: () => <ItemSelected /> };
