import { ProgressDefault } from '../examples/progress/default';
import { ProgressWithLabelAndValue } from '../examples/progress/with-label-and-value';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Progress',
  description: 'Known progress, like an upload.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Progress'
      description='Known progress, like an upload: a 4px track in the muted fill, the brand fill for what is done. For unknown progress, Loader or Skeleton.'>
      <ExampleSection title='Default'>
        <ProgressDefault />
      </ExampleSection>
      <ExampleSection
        title='With label and value'
        description={
          <>
            <Code>ProgressLabel · ProgressValue</Code>
          </>
        }>
        <ProgressWithLabelAndValue />
      </ExampleSection>
    </FoundationPage>
  ),
});
