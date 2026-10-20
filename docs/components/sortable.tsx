import { SortableDefault } from '../examples/sortable/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Sortable',
  description: 'Rows a person puts in order themselves.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Sortable' description='Rows a person puts in order themselves.'>
      <ExampleSection
        title='Default'
        description='Drag a row by its handle, or Tab to it, Space to lift, arrows to move, Space to drop.'
        bare>
        <SortableDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
