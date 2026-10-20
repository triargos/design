import { ComboboxDefault } from '../examples/combobox/default';
import { ComboboxGrouped } from '../examples/combobox/grouped';
import { ComboboxMultiple } from '../examples/combobox/multiple';
import { ComboboxPlaceholder } from '../examples/combobox/placeholder';
import { ComboboxStates } from '../examples/combobox/states';
import { ComboboxTriggerWithSearch } from '../examples/combobox/trigger-with-search';
import { ComboboxVirtualized } from '../examples/combobox/virtualized';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Combobox',
  description: 'A field that filters a list as you type; the parts to compose your own.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Combobox'
      description='A field that filters a list as you type: Base UI Combobox on the field surface, the list a popup. Search Select covers picking from a list; compose these parts when a list needs its own shape.'>
      <ExampleSection title='Default' description='With a value, a clear button takes the place of the ⇅ button.'>
        <ComboboxDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder'>
        <ComboboxPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>ComboboxChips</Code>: 32px chips, 4px in, rounded-inner. The popup anchors to the chips field.
          </>
        }>
        <ComboboxMultiple />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>items</Code> as groups; each <Code>ComboboxGroup</Code> renders its own{' '}
            <Code>ComboboxCollection</Code>.
          </>
        }>
        <ComboboxGrouped />
      </ExampleSection>
      <ExampleSection
        title='Trigger with search'
        description={
          <>
            <Code>ComboboxTrigger</Code> looks like a select; <Code>ComboboxSearch</Code> sits in the popup.
          </>
        }>
        <ComboboxTriggerWithSearch />
      </ExampleSection>
      <ExampleSection
        title='Virtualized'
        description={
          <>
            <Code>virtualized</Code> + <Code>ComboboxVirtualizedList</Code>: 2,100 tasks, only the rows in view render.
          </>
        }>
        <ComboboxVirtualized />
      </ExampleSection>
      <ExampleSection
        title='States'
        description={
          <>
            Invalid and disabled. With no match the list shows <Code>ComboboxEmpty</Code>.
          </>
        }>
        <ComboboxStates />
      </ExampleSection>

      <FoundationSection title='Which one'>
        <SpecimenList>
          <SpecimenRow name='Pick from a list' meta={<Code>SearchSelect</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Any length, one value or many: members, projects, labels.
            </p>
          </SpecimenRow>
          <SpecimenRow name='List or own text' meta={<Code>OptionSelect · SearchSelect allowCustom</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Short list, a custom value rare: <Code>OptionSelect allowCustom</Code>, an “Other…” row with a text field.
              Longer list, or typing is the main path: <Code>SearchSelect allowCustom</Code>. Both hand over a plain
              string.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Own composition' meta={<Code>Combobox · ComboboxList · ComboboxChips</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Grouped lists, rows with their own content, or a select-like trigger with search in the popup. Add{' '}
              <Code>virtualized</Code> + <Code>ComboboxVirtualizedList</Code> for long lists.
            </p>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
});
