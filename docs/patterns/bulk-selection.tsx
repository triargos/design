import { BulkSelectionDefault } from '../examples/patterns/bulk-selection/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Bulk Selection',
  description: 'Select rows, act on all of them.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='Bulk Selection'
      description='Select rows, act on all of them: a checkbox column with select-all in a card table, and a Bottom Float Menu with the count, clear and the actions while anything is selected.'>
      <ExampleSection title='Default' bare>
        <BulkSelectionDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
