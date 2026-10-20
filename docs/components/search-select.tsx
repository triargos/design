import { SearchSelectCustomValue } from '../examples/search-select/custom-value';
import { SearchSelectDefault } from '../examples/search-select/default';
import { SearchSelectInADialog } from '../examples/search-select/in-a-dialog';
import { SearchSelectInAField } from '../examples/search-select/in-a-field';
import { SearchSelectManyOptions } from '../examples/search-select/many-options';
import { SearchSelectMultiple } from '../examples/search-select/multiple';
import { SearchSelectPlaceholder } from '../examples/search-select/placeholder';
import { SearchSelectStates } from '../examples/search-select/states';
import { SearchSelectWithDescription } from '../examples/search-select/with-description';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Search Select',
  description: 'A select you can type into, for any list length; one value or many.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Search Select'
      description='A select you can type into, for any list length. Type to filter, Enter picks the first match. One value with a clear button, or many as chips; the list is always virtualized.'>
      <ExampleSection title='Default'>
        <SearchSelectDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder'>
        <SearchSelectPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>multiple</Code>: chips in the field.
          </>
        }>
        <SearchSelectMultiple />
      </ExampleSection>
      <ExampleSection
        title='With description'
        description={
          <>
            An option's <Code>description</Code> shows muted beside its label.
          </>
        }>
        <SearchSelectWithDescription />
      </ExampleSection>
      <ExampleSection
        title='Custom value'
        description={
          <>
            <Code>allowCustom</Code>: the value is an option's value or the typed text. While the query names no option,
            the last row takes it; Enter picks it once nothing else matches.
          </>
        }>
        <SearchSelectCustomValue />
      </ExampleSection>
      <ExampleSection title='Many options' description='2,000 members, the same every time.'>
        <SearchSelectManyOptions />
      </ExampleSection>
      <ExampleSection title='In a field' description='Field, label and error around it.'>
        <SearchSelectInAField />
      </ExampleSection>
      <ExampleSection title='In a dialog' description='The popup portals above the dialog and keeps focus in it.'>
        <SearchSelectInADialog />
      </ExampleSection>
      <ExampleSection
        title='States'
        description={
          <>
            Loading (<Code>emptyText</Code>), <Code>aria-invalid</Code>, <Code>disabled</Code>.
          </>
        }>
        <SearchSelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
