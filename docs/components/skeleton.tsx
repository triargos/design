import { SkeletonListExample } from '../examples/skeleton/list';
import { SkeletonShapes } from '../examples/skeleton/shapes';
import { SkeletonStepper } from '../examples/skeleton/stepper';
import { SkeletonTextBlock } from '../examples/skeleton/text-block';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Skeleton',
  description: 'A loading region in the shape of its content.',
  group: 'Components',
  Page: () => (
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
});
