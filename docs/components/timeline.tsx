import { TimelineDefault } from '../examples/timeline/default';
import { TimelineHorizontal } from '../examples/timeline/horizontal';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Timeline',
  description: 'Events in order, with what happened when.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Timeline' description='Events in order, with what happened when.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>value={'{3}'}</Code>: three steps reached.
          </>
        }>
        <TimelineDefault />
      </ExampleSection>
      <ExampleSection title='Horizontal'>
        <TimelineHorizontal />
      </ExampleSection>
    </FoundationPage>
  ),
});
