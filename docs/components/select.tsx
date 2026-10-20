import { SelectAllowCustom } from '../examples/select/allow-custom';
import { SelectDefault } from '../examples/select/default';
import { SelectGrouped } from '../examples/select/grouped';
import { SelectInAField } from '../examples/select/in-a-field';
import { SelectStates } from '../examples/select/states';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Select',
  description: 'A field that opens a short list of options.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Select'
      description='A field that opens a short list of options, no typing. Values are strings; items gives the trigger its labels. To search, or for a long list, Combobox.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>Select items value onValueChange</Code> &gt; <Code>SelectTrigger</Code> &gt; <Code>SelectValue</Code>,{' '}
            <Code>SelectContent</Code> &gt; <Code>SelectItem</Code>.
          </>
        }>
        <SelectDefault />
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
      <ExampleSection
        title='Allow custom'
        description={
          <>
            <Code>allowCustom</Code>: the value is an option's value or the typed text. <Code>SelectCustomItem</Code>{' '}
            ends the list; picking it emits <Code>''</Code> and opens <Code>SelectCustomInput</Code>, which takes focus.
          </>
        }>
        <SelectAllowCustom />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            Required: a non-empty check covers the custom row without text (<Code>''</Code>); <Code>aria-invalid</Code>{' '}
            then marks the text field.
          </>
        }>
        <SelectInAField />
      </ExampleSection>
      <ExampleSection title='States' description='Placeholder, invalid, read-only, disabled.'>
        <SelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
