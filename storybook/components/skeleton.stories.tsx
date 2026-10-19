import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkeletonListExample } from '../examples/skeleton/list';
import { SkeletonShapes } from '../examples/skeleton/shapes';
import { SkeletonStepper } from '../examples/skeleton/stepper';
import { SkeletonTextBlock } from '../examples/skeleton/text-block';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Skeleton',
  parameters: { description: 'A loading region in the shape of its content.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Skeleton'
      description='A loading region shows its shape in shimmer (animate-shimmer), so the page does not jump when the content arrives.'>
      <ExampleSection title='Shapes' description='An avatar, a title, a line.'>
        <SkeletonShapes />
      </ExampleSection>
      <ExampleSection title='Text block' description='A paragraph: full lines, the last one short.'>
        <SkeletonTextBlock />
      </ExampleSection>
      <ExampleSection
        title='List'
        description={
          <>
            <Code>SkeletonList</Code>: n full-width lines.
          </>
        }
        bare>
        <SkeletonListExample />
      </ExampleSection>
      <ExampleSection
        title='Stepper'
        description={
          <>
            <Code>StepperSkeleton</Code>: the stepper while its steps load.
          </>
        }>
        <SkeletonStepper />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Shapes: Story = { render: () => <SkeletonShapes /> };
export const TextBlock: Story = {
  name: 'Text block',
  render: () => <SkeletonTextBlock />,
};
export const List: Story = { render: () => <SkeletonListExample /> };
export const Stepper: Story = { render: () => <SkeletonStepper /> };
