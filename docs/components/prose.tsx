import { ProseDefault } from '../examples/prose/default';
import { ProseEditable } from '../examples/prose/editable';
import { ProseRenderedHtml } from '../examples/prose/rendered-html';
import { ProseSecondary } from '../examples/prose/secondary';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Prose',
  description: 'Rendered rich text in the body role.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Prose'
      description='Rendered rich text (TipTap HTML, sanitized HTML, markdown) in the body role: h1 in heading, h2–h4 in body medium, lists, links, code, quotes and rules on the tokens, in both modes. Spacing is in em, so it follows the text size.'>
      <ExampleSection title='Default' bare>
        <ProseDefault />
      </ExampleSection>
      <ExampleSection
        title='Secondary'
        description={
          <>
            <Code>className='text-muted-foreground'</Code>
          </>
        }>
        <ProseSecondary />
      </ExampleSection>
      <ExampleSection title='Rendered HTML' description='Sanitize first.'>
        <ProseRenderedHtml />
      </ExampleSection>
      <ExampleSection
        title='Editable'
        description={
          <>
            <Code>proseVariants()</Code> on an editor’s editable element
          </>
        }>
        <ProseEditable />
      </ExampleSection>
    </FoundationPage>
  ),
});
