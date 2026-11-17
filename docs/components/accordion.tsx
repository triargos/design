import { AccordionControlled } from '../examples/accordion/controlled';
import { AccordionDefault } from '../examples/accordion/default';
import { AccordionFlush } from '../examples/accordion/flush';
import { AccordionInASheet } from '../examples/accordion/in-a-sheet';
import { AccordionMultiple } from '../examples/accordion/multiple';
import { AccordionWithActions } from '../examples/accordion/with-actions';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Accordion',
  description: 'Sections that open in place, for content people scan by title.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Accordion' description='Sections that open in place, for content people scan by title.'>
      <ExampleSection title='Default' description='One open at a time.'>
        <AccordionDefault />
      </ExampleSection>
      <ExampleSection
        title='Flush'
        description={
          <>
            <Code>variant='flush'</Code> in <Code>CardContent</Code>: rows to the card edge, clipped to its corners, a{' '}
            <Code>row-hover</Code> fill, the content indented to the title.
          </>
        }
        bare>
        <AccordionFlush />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>multiple</Code>: several sections open side by side.
          </>
        }>
        <AccordionMultiple />
      </ExampleSection>
      <ExampleSection
        title='Controlled'
        description={
          <>
            <Code>value</Code> and <Code>onValueChange</Code>: open or close all from outside.
          </>
        }>
        <AccordionControlled />
      </ExampleSection>
      <ExampleSection
        title='With actions'
        description={
          <>
            <Code>actions</Code> on the trigger: the item's buttons beside it, not in it. Open, an <Code>ItemList</Code>{' '}
            starts on the row's edge.
          </>
        }>
        <AccordionWithActions />
      </ExampleSection>
      <ExampleSection
        title='In a sheet'
        description={
          <>
            <Code>variant='flush'</Code> in a <Code>SheetBody</Code> runs to the sheet's edge.
          </>
        }>
        <AccordionInASheet />
      </ExampleSection>
    </FoundationPage>
  ),
});
