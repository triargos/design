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
    <FoundationPage title='Page Content' description='Page layout: the header, then the content blocks.'>
      <ExampleSection title='Default' description='The content sits 32px below the header; blocks sit 16px apart.'>
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
