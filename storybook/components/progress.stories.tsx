import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressDefault } from '../examples/progress/default';
import { ProgressWithLabelAndValue } from '../examples/progress/with-label-and-value';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Progress',
  parameters: { description: 'Known progress, like an upload.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Progress'
      description='Known progress, like an upload: a 4px track in the muted fill, the brand fill for what is done. For unknown progress, Loader or Skeleton.'>
      <ExampleSection title='Default'>
        <ProgressDefault />
      </ExampleSection>
      <ExampleSection
        title='With label and value'
        description={
          <>
            <Code>ProgressLabel · ProgressValue</Code>
          </>
        }>
        <ProgressWithLabelAndValue />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ProgressDefault /> };
export const WithLabelAndValue: Story = {
  name: 'With label and value',
  render: () => <ProgressWithLabelAndValue />,
};
