import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs } from '~/components/ui/tabs';

import { TabsAsNav } from '../examples/tabs/as-nav';
import { TabsAsRadio } from '../examples/tabs/as-radio';
import { TabsDefault } from '../examples/tabs/default';
import { TabsInACard } from '../examples/tabs/in-a-card';
import { TabsPill } from '../examples/tabs/pill';
import { TabsUnderline } from '../examples/tabs/underline';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Tabs',
  parameters: { description: 'One tab component in three variants, with an indicator that slides between tabs.' },
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Tabs'
      description='One tab component in three variants, with an indicator that slides between tabs. TabsList as picks the semantics: Base UI tabs, page links, or a single choice.'>
      <ExampleSection
        title='Default'
        description='Segmented: views of one page. The raised chip slides to the active tab. The last tab is disabled.'>
        <TabsDefault />
      </ExampleSection>
      <ExampleSection title='Underline' description='Sections inside a card or a popup.'>
        <TabsUnderline />
      </ExampleSection>
      <ExampleSection title='Pill' description='Filters and single choices, in the brand fill.'>
        <TabsPill />
      </ExampleSection>
      <ExampleSection
        title='As nav'
        description={
          <>
            <Code>TabsList as='nav'</Code>: page links with aria-current.
          </>
        }>
        <TabsAsNav />
      </ExampleSection>
      <ExampleSection
        title='As radio'
        description={
          <>
            <Code>TabsList as='radio'</Code>: a single choice, every pill a tab stop.
          </>
        }>
        <TabsAsRadio />
      </ExampleSection>
      <ExampleSection title='In a card' bare>
        <TabsInACard />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <TabsDefault /> };
export const Underline: Story = { render: () => <TabsUnderline /> };
export const Pill: Story = { render: () => <TabsPill /> };
export const AsNav: Story = {
  name: 'As nav',
  render: () => <TabsAsNav />,
};
export const AsRadio: Story = {
  name: 'As radio',
  render: () => <TabsAsRadio />,
};
export const InACard: Story = {
  name: 'In a card',
  render: () => <TabsInACard />,
};
