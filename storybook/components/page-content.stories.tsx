import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageContentDefault } from '../examples/page-content/default';
import { PageContentWithSections } from '../examples/page-content/with-sections';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Page Content',
  parameters: { description: 'Page layout: the header, then the content blocks.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Page Content'
      description='Page layout: the header, then the content page (32px) below it, whatever the header holds. Blocks sit group (16px) apart; a PageSection that is a direct child sits section (48px) from its neighbours.'>
      <ExampleSection title='Default'>
        <PageContentDefault />
      </ExampleSection>
      <ExampleSection
        title='With sections'
        description={
          <>
            A <Code>PageSection</Code> child sits 48px from its neighbours.
          </>
        }>
        <PageContentWithSections />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <PageContentDefault /> };
export const WithSections: Story = {
  name: 'With sections',
  render: () => <PageContentWithSections />,
};
