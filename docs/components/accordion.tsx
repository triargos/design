import { AccordionControlled } from '../examples/accordion/controlled';
import { AccordionDefault } from '../examples/accordion/default';
import { AccordionFlush } from '../examples/accordion/flush';
import { AccordionInACard } from '../examples/accordion/in-a-card';
import { AccordionInASheet } from '../examples/accordion/in-a-sheet';
import { AccordionMultiple } from '../examples/accordion/multiple';
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
            <Code>variant='flush'</Code> in <Code>CardContent className='overflow-hidden'</Code>: rows to the card edge,
            a <Code>row-hover</Code> fill, the content indented to the title.
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
      <ExampleSection title='In a card' bare>
        <AccordionInACard />
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
