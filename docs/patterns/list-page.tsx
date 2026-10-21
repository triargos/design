import { ListPageDefault } from '../examples/patterns/list-page/default';
import { ListPageWithoutSearch } from '../examples/patterns/list-page/without-search';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'List Page',
  description: 'A page of one list: the add action and a search above the rows in a card.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='List Page'
      description='A page of one list: the title, the add action, a search when the list needs one, and the rows in a card. The add action lines up with the card’s edge, inset by the shell’s 4px.'>
      <ExampleSection
        title='Default'
        description={
          <>
            A toolbar group above the card: search on the left, add on the right. The field is <Code>bg-card</Code> in
            light mode, at most <Code>max-w-xs</Code> wide; Escape clears it, and a query with no match shows an Empty
            that clears it too.
          </>
        }
        bare>
        <ListPageDefault />
      </ExampleSection>
      <ExampleSection
        title='Without search'
        description='No toolbar: the add action sits in the header, centered on the title and description.'
        bare>
        <ListPageWithoutSearch />
      </ExampleSection>
    </FoundationPage>
  ),
});
