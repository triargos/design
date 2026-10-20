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
      description='Select rows, act on all of them: a checkbox column with select-all in a card table, and a bar with the count, the actions and clear while anything is selected. Deleting asks in an Alert Dialog.'>
      <ExampleSection title='Default' bare>
        <BulkSelectionDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
