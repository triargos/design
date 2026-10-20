import { ListInCardDefault } from '../examples/patterns/list-in-card/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'List in Card',
  description: 'Every list on a page: an ItemList flush in an Card.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='List in Card'
      description='Every list on a page: CardContent with overflow-hidden around an ItemList. The header holds the add action; each row ends in a status and a ghost menu, on one column with the header action.'>
      <ExampleSection title='Default' bare>
        <ListInCardDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
