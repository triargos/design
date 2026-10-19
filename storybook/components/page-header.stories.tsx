import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageHeaderDefault } from '../examples/page-header/default';
import { PageHeaderPageSection } from '../examples/page-header/page-section';
import { PageHeaderWithBackLink } from '../examples/page-header/with-back-link';
import { PageHeaderWithTabs } from '../examples/page-header/with-tabs';
import { PageHeaderWithTools } from '../examples/page-header/with-tools';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Page Header',
  parameters: { description: 'The page title and description, with tools, navigation or tabs.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Page Header'
      description='Title and description first; tools on the right; navigation above the title, view tabs below it. PageContent sets the 32px to the content, whatever the header holds.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>PageHeaderGroup · PageHeader · PageDescription</Code>
          </>
        }>
        <PageHeaderDefault />
      </ExampleSection>
      <ExampleSection
        title='With tools'
        description={
          <>
            <Code>PageHeaderRow · PageHeaderTools</Code>: the main action last.
          </>
        }>
        <PageHeaderWithTools />
      </ExampleSection>
      <ExampleSection
        title='With back link'
        description={
          <>
            <Code>PageHeaderSection · PageHeaderBackLink · PageHeaderMeta</Code>
          </>
        }>
        <PageHeaderWithBackLink />
      </ExampleSection>
      <ExampleSection
        title='With tabs'
        description={
          <>
            <Code>TabsList as='nav'</Code> below the title.
          </>
        }>
        <PageHeaderWithTabs />
      </ExampleSection>
      <ExampleSection
        title='Page section'
        description={
          <>
            <Code>PageSection</Code>: a titled group of cards inside a page.
          </>
        }>
        <PageHeaderPageSection />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <PageHeaderDefault /> };
export const WithTools: Story = {
  name: 'With tools',
  render: () => <PageHeaderWithTools />,
};
export const WithBackLink: Story = {
  name: 'With back link',
  render: () => <PageHeaderWithBackLink />,
};
export const WithTabs: Story = {
  name: 'With tabs',
  render: () => <PageHeaderWithTabs />,
};
export const PageSection: Story = {
  name: 'Page section',
  render: () => <PageHeaderPageSection />,
};
