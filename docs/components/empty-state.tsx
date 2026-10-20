import { EmptyStateBordered } from '../examples/empty-state/bordered';
import { EmptyStateCarousel } from '../examples/empty-state/carousel';
import { EmptyStateDefault } from '../examples/empty-state/default';
import { EmptyStateSizes } from '../examples/empty-state/sizes';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Empty State',
  description: 'What an empty list or area holds once it fills, and how to fill it.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Empty State'
      description='What an empty list or area holds once it fills, and how to fill it: a skeleton of the content, a title, one line, at most one action.'>
      <ExampleSection title='Default' description='In a card: a skeleton stack, a title, one line, one action.' bare>
        <EmptyStateDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code> for a section inside a card.
          </>
        }
        bare>
        <EmptyStateSizes />
      </ExampleSection>
      <ExampleSection
        title='Bordered'
        description='A dashed edge, for an empty area on the page itself, not in a card.'
        bare>
        <EmptyStateBordered />
      </ExampleSection>
      <ExampleSection title='Carousel' description='For media: the skeleton fans out as a carousel.' bare>
        <EmptyStateCarousel />
      </ExampleSection>
    </FoundationPage>
  ),
});
