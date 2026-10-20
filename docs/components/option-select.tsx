import { OptionSelectAllowCustom } from '../examples/option-select/allow-custom';
import { OptionSelectDefault } from '../examples/option-select/default';
import { OptionSelectInAField } from '../examples/option-select/in-a-field';
import { OptionSelectStates } from '../examples/option-select/states';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Option Select',
  description: 'A select over a short list of options, optionally with an “Other…” row.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Option Select'
      description='A select over a short list of options, with Search Select’s items and value: no typing, no virtualization. For long lists or search, Search Select.'>
      <ExampleSection title='Default'>
        <OptionSelectDefault />
      </ExampleSection>
      <ExampleSection
        title='Allow custom'
        description={
          <>
            <Code>allowCustom</Code>: the value is an option's value or the typed text. “Other…” stays last, after a
            separator; picking it emits <Code>''</Code>, folds open a text field and focuses it.
          </>
        }>
        <OptionSelectAllowCustom />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            Required: a non-empty check covers “Other” without text (<Code>''</Code>); <Code>aria-invalid</Code> then
            marks the text field.
          </>
        }>
        <OptionSelectInAField />
      </ExampleSection>
      <ExampleSection title='States' description='Placeholder, invalid, disabled, size sm.'>
        <OptionSelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
