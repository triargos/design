import { TabsAsNav } from '../examples/tabs/as-nav';
import { TabsAsRadio } from '../examples/tabs/as-radio';
import { TabsDefault } from '../examples/tabs/default';
import { TabsInACard } from '../examples/tabs/in-a-card';
import { TabsPill } from '../examples/tabs/pill';
import { TabsInline } from '../examples/tabs/inline';
import { TabsUnderline } from '../examples/tabs/underline';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Tabs',
  description: 'Tabs in three variants, with an indicator that slides between them.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Tabs' description='Tabs in three variants, with an indicator that slides between them.'>
      <ExampleSection
        title='Default'
        description='Segmented: views of one page. The raised chip slides to the active tab. The last tab is disabled.'>
        <TabsDefault />
      </ExampleSection>
      <ExampleSection title='Underline' description='Sections inside a card or a popup.'>
        <TabsUnderline />
      </ExampleSection>
      <ExampleSection title='Pill' description='Filters and single choices, in the brand fill.'>
        <TabsPill />
      </ExampleSection>
      <ExampleSection
        title='As nav'
        description={
          <>
            <Code>TabsNav</Code> and <Code>TabsLink</Code>: page links; <Code>current</Code> marks the page.
          </>
        }>
        <TabsAsNav />
      </ExampleSection>
      <ExampleSection
        title='As radio'
        description={
          <>
            <Code>TabsRadioGroup</Code> and <Code>TabsRadio</Code>: a single choice, every pill a tab stop.
          </>
        }>
        <TabsAsRadio />
      </ExampleSection>
      <ExampleSection
        title='Inline'
        description={
          <>
            <Code>variant='inline'</Code>: a segmented list, round and 2px into its track, for a control inside a row (a
            menu row's theme switch). Icon-only tabs need an <Code>aria-label</Code>; <Code>flex-1</Code> tabs fill the
            width.
          </>
        }>
        <TabsInline />
      </ExampleSection>
      <ExampleSection title='In a card' bare>
        <TabsInACard />
      </ExampleSection>
    </FoundationPage>
  ),
});
