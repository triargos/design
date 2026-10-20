import { PagePatternDefault } from '../examples/patterns/page/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Page',
  description: 'A page’s header and sections, spaced with the spacing steps.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='Page'
      description='A page’s header and sections, written with the spacing steps: the header page apart from the content, sections section apart, titles indented to the text of the cards below. Copy it into the app as its page layout.'>
      <ExampleSection title='Default' bare>
        <PagePatternDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
