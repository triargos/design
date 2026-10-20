import type { Meta, StoryObj } from '@storybook/react-vite';

import { BreadcrumbCustomSeparator } from '../examples/breadcrumb/custom-separator';
import { BreadcrumbDefault } from '../examples/breadcrumb/default';
import { BreadcrumbWithEllipsis } from '../examples/breadcrumb/with-ellipsis';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Breadcrumb',
  parameters: { description: 'Where a page sits, as links back up the tree.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage title='Breadcrumb' description='Where a page sits, as links back up the tree.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>BreadcrumbLink</Code> up the tree; <Code>BreadcrumbPage</Code> is the current page.
          </>
        }>
        <BreadcrumbDefault />
      </ExampleSection>
      <ExampleSection
        title='With ellipsis'
        description={
          <>
            <Code>BreadcrumbEllipsis</Code> stands for the levels between.
          </>
        }>
        <BreadcrumbWithEllipsis />
      </ExampleSection>
      <ExampleSection
        title='Custom separator'
        description={
          <>
            <Code>BreadcrumbSeparator</Code> children replace the chevron.
          </>
        }>
        <BreadcrumbCustomSeparator />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <BreadcrumbDefault /> };
export const WithEllipsis: Story = {
  name: 'With ellipsis',
  render: () => <BreadcrumbWithEllipsis />,
};
export const CustomSeparator: Story = {
  name: 'Custom separator',
  render: () => <BreadcrumbCustomSeparator />,
};
