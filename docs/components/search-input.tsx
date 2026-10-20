import { SearchInputDefault } from '../examples/search-input/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Search Input',
  description: 'A search field with a clear button.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Search Input'
      description='A search field with a clear button. ⌘F focuses it, Escape clears it.'>
      <ExampleSection title='Default'>
        <SearchInputDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
