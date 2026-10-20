import { SkeletonShapes } from '../examples/skeleton/shapes';
import { SkeletonTextBlock } from '../examples/skeleton/text-block';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Skeleton',
  description: 'A loading region in the shape of its content.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Skeleton'
      description='A loading region shows its shape in the skeleton fill, pulsing, so the page does not jump when the content arrives. Every skeleton pulses in step, whenever it mounts.'>
      <ExampleSection title='Shapes' description='An avatar, a title, a line.'>
        <SkeletonShapes />
      </ExampleSection>
      <ExampleSection title='Text block' description='A paragraph: full lines, the last one short.'>
        <SkeletonTextBlock />
      </ExampleSection>
    </FoundationPage>
  ),
});
