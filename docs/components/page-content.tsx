import { PageContentDefault } from '../examples/page-content/default';
import { PageContentWithSections } from '../examples/page-content/with-sections';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Page Content',
  description: 'Page layout: the header, then the content blocks.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Page Content' description='Page layout: the header, then the content blocks.'>
      <ExampleSection title='Default' description='The content sits 32px below the header; blocks sit 16px apart.'>
        <PageContentDefault />
      </ExampleSection>
      <ExampleSection
        title='With sections'
        description={
          <>
            A <Code>PageSection</Code> child sits 48px from its neighbours.
          </>
        }>
        <PageContentWithSections />
      </ExampleSection>
    </FoundationPage>
  ),
});
