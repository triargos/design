import { ComboboxAllowCustom } from '../examples/combobox/allow-custom';
import { ComboboxDefault } from '../examples/combobox/default';
import { ComboboxInADialog } from '../examples/combobox/in-a-dialog';
import { ComboboxInAField } from '../examples/combobox/in-a-field';
import { ComboboxMatching } from '../examples/combobox/matching';
import { ComboboxMultiple } from '../examples/combobox/multiple';
import { ComboboxMultipleAllowCustom } from '../examples/combobox/multiple-allow-custom';
import { ComboboxStates } from '../examples/combobox/states';
import { ComboboxVirtualized } from '../examples/combobox/virtualized';
import { ComboboxWithDescription } from '../examples/combobox/with-description';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Combobox',
  description: 'A field that filters a list as you type; one value or many.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Combobox'
      description='A field that filters a list as you type, best matches first: Enter picks the first. Values are the items’ value strings. One value with a clear button, many as chips, or text of your own. For a short list without typing, Select.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>Combobox items value onValueChange</Code> &gt; <Code>ComboboxInput</Code>,{' '}
            <Code>ComboboxContent</Code> &gt; <Code>ComboboxEmpty</Code>, <Code>ComboboxList</Code> &gt;{' '}
            <Code>ComboboxItem value=&#123;item&#125;</Code>.
          </>
        }>
        <ComboboxDefault />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>multiple</Code>: <Code>ComboboxChips</Code> &gt; <Code>ComboboxValue</Code> of{' '}
            <Code>ComboboxChip</Code>s, then <Code>ComboboxChipsInput</Code>. 32px chips, 4px in.
          </>
        }>
        <ComboboxMultiple />
      </ExampleSection>
      <ExampleSection
        title='Matching'
        description={
          <>
            While you type, the exact label leads, then labels that start with the query, then a word that does, then
            the rest; within each, the order of <Code>items</Code>. Typing <Code>design</Code> lists Design first,
            though Design system comes earlier in <Code>items</Code>; Enter picks it.
          </>
        }>
        <ComboboxMatching />
      </ExampleSection>
      <ExampleSection title='With description' description='A row’s content is yours; the check keeps its column.'>
        <ComboboxWithDescription />
      </ExampleSection>
      <ExampleSection
        title='Allow custom'
        description={
          <>
            <Code>allowCustom</Code>: the value is an option's value or the typed text. While the query names no option,
            the last row takes it; Enter picks it once nothing else matches. <Code>customLabel</Code> and{' '}
            <Code>customOptionLabel</Code> word those rows.
          </>
        }>
        <ComboboxAllowCustom />
      </ExampleSection>
      <ExampleSection
        title='Multiple, allow custom'
        description={
          <>
            <Code>multiple allowCustom</Code>: chips of options and typed text. A typed chip’s value and label are its
            text; <Code>isCustomValue(item)</Code> tells it apart.
          </>
        }>
        <ComboboxMultipleAllowCustom />
      </ExampleSection>
      <ExampleSection
        title='Virtualized'
        description={
          <>
            <Code>virtualized</Code>: 2,000 members, only the rows in view render. Rows keep to one line.
          </>
        }>
        <ComboboxVirtualized />
      </ExampleSection>
      <ExampleSection title='In a field' description='Field, label and error around it.'>
        <ComboboxInAField />
      </ExampleSection>
      <ExampleSection title='In a dialog' description='The popup portals above the dialog and keeps focus in it.'>
        <ComboboxInADialog />
      </ExampleSection>
      <ExampleSection title='States' description='Placeholder, loading, invalid, read-only, disabled.'>
        <ComboboxStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
