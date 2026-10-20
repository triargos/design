import { FadeInDefault } from '../examples/fade-in/default';
import { FadeInFadeOut } from '../examples/fade-in/fade-out';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Fade In',
  description: 'Content that arrives after a load fades in once.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Fade In'
      description='Content that arrives after a load fades in once (150ms, opacity only). useShouldFadeIn skips it when the first render already has the data. FadeOut for content that leaves.'>
      <ExampleSection title='Default' description='Replay with the button.'>
        <FadeInDefault />
      </ExampleSection>
      <ExampleSection
        title='Fade out'
        description={
          <>
            <Code>FadeOut</Code>: 300ms, as the content leaves.
          </>
        }>
        <FadeInFadeOut />
      </ExampleSection>
    </FoundationPage>
  ),
});
