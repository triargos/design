import { EmptyBordered } from '../examples/empty/bordered';
import { EmptyDefault } from '../examples/empty/default';
import { EmptyError } from '../examples/empty/error';
import { EmptySizes } from '../examples/empty/sizes';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Empty',
  description: 'An area with nothing to show yet, or one that failed to load.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Empty'
      description='An area with nothing to show yet: a skeleton of the content, a title, one line, at most one action. A failure is the same shape with an icon and role="alert".'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>EmptyMedia</Code> (a skeleton stack), <Code>EmptyTitle</Code>, <Code>EmptyDescription</Code>,{' '}
            <Code>EmptyContent</Code>.
          </>
        }
        bare>
        <EmptyDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code> for a section inside a card.
          </>
        }
        bare>
        <EmptySizes />
      </ExampleSection>
      <ExampleSection
        title='Bordered'
        description='A dashed edge, for an empty area on the page itself, not in a card.'
        bare>
        <EmptyBordered />
      </ExampleSection>
      <ExampleSection
        title='Error'
        description={
          <>
            <Code>role='alert'</Code> and <Code>EmptyMedia variant='icon'</Code>: what failed, and the next step.
          </>
        }
        bare>
        <EmptyError />
      </ExampleSection>
    </FoundationPage>
  ),
});
