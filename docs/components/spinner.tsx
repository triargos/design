import { LoaderDefault } from '../examples/spinner/default';
import { LoaderInAButton } from '../examples/spinner/in-a-button';
import { LoaderSizes } from '../examples/spinner/sizes';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Spinner',
  description: 'The spinner, in currentColor.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Spinner'
      description='The spinner alone, in currentColor: inside a button it takes the label color; alone, give it a text level. Still with reduced motion.'>
      <ExampleSection title='Default'>
        <LoaderDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size</Code> 16 · 20 · 24 · 32
          </>
        }>
        <LoaderSizes />
      </ExampleSection>
      <ExampleSection
        title='In a button'
        description={
          <>
            Use <Code>isLoading</Code>, not a Spinner child: the label keeps the width; the spinner shows at least
            800ms.
          </>
        }>
        <LoaderInAButton />
      </ExampleSection>
    </FoundationPage>
  ),
});
