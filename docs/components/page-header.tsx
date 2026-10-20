import { PageHeaderDefault } from '../examples/page-header/default';
import { PageHeaderPageSection } from '../examples/page-header/page-section';
import { PageHeaderWithActions } from '../examples/page-header/with-actions';
import { PageHeaderWithBackLink } from '../examples/page-header/with-back-link';
import { PageHeaderWithTabs } from '../examples/page-header/with-tabs';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Page Header',
  description: 'The page title and description, with actions, navigation or tabs.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Page Header' description='The page title and description, with actions, navigation or tabs.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>PageHeaderGroup · PageTitle · PageDescription</Code> in the <Code>PageContent</Code> header.
          </>
        }>
        <PageHeaderDefault />
      </ExampleSection>
      <ExampleSection
        title='With actions'
        description={
          <>
            <Code>PageHeaderRow · PageHeaderActions</Code>: the main action last.
          </>
        }>
        <PageHeaderWithActions />
      </ExampleSection>
      <ExampleSection
        title='With back link'
        description={
          <>
            <Code>PageHeaderBackLink</Code> above the title, <Code>PageHeaderMeta</Code> under it.
          </>
        }>
        <PageHeaderWithBackLink />
      </ExampleSection>
      <ExampleSection
        title='With tabs'
        description={
          <>
            <Code>TabsNav</Code> below the title.
          </>
        }>
        <PageHeaderWithTabs />
      </ExampleSection>
      <ExampleSection
        title='Page section'
        description={
          <>
            <Code>PageSection</Code>: a titled group of cards inside a page.
          </>
        }>
        <PageHeaderPageSection />
      </ExampleSection>
    </FoundationPage>
  ),
});
