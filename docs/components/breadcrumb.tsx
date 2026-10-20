import { BreadcrumbCustomSeparator } from '../examples/breadcrumb/custom-separator';
import { BreadcrumbDefault } from '../examples/breadcrumb/default';
import { BreadcrumbWithEllipsis } from '../examples/breadcrumb/with-ellipsis';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Breadcrumb',
  description: 'Where a page sits, as links back up the tree.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Breadcrumb' description='Where a page sits, as links back up the tree.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>BreadcrumbLink</Code> up the tree; <Code>BreadcrumbPage</Code> is the current page.
          </>
        }>
        <BreadcrumbDefault />
      </ExampleSection>
      <ExampleSection
        title='With ellipsis'
        description={
          <>
            <Code>BreadcrumbEllipsis</Code> stands for the levels between.
          </>
        }>
        <BreadcrumbWithEllipsis />
      </ExampleSection>
      <ExampleSection
        title='Custom separator'
        description={
          <>
            <Code>BreadcrumbSeparator</Code> children replace the chevron.
          </>
        }>
        <BreadcrumbCustomSeparator />
      </ExampleSection>
    </FoundationPage>
  ),
});
