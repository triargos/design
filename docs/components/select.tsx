import { SelectDefault } from '../examples/select/default';
import { SelectGrouped } from '../examples/select/grouped';
import { SelectSizes } from '../examples/select/sizes';
import { SelectStates } from '../examples/select/states';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Select',
  description: 'A field that opens a list of options.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Select'
      description='A field that opens a list of options: the parts to compose. For a list of options with an “Other…” row, Option Select; for many options or search, Search Select.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>items</Code> lets <Code>SelectValue</Code> show the label.
          </>
        }>
        <SelectDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code> (36px) in toolbars and filters.
          </>
        }>
        <SelectSizes />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>SelectGroup · SelectLabel · SelectSeparator</Code>
          </>
        }>
        <SelectGrouped />
      </ExampleSection>
      <ExampleSection title='States' description='Placeholder, invalid, read-only, disabled.'>
        <SelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
