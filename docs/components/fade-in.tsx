import { FadeInDefault } from '../examples/fade-in/default';
import { FadeInFirstLoadOnly } from '../examples/fade-in/first-load-only';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Fade In',
  description: 'Content that arrives after a load fades in.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Fade In'
      description='Content that arrives after a load fades in over duration-feedback, opacity only. Content that was there from the first render shows at once.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>FadeIn</Code> in place of the skeleton
          </>
        }>
        <FadeInDefault />
      </ExampleSection>
      <ExampleSection
        title='First load only'
        description={
          <>
            <Code>useShouldFadeIn(pending)</Code> → <Code>animate</Code>: cached data does not fade
          </>
        }>
        <FadeInFirstLoadOnly />
      </ExampleSection>
    </FoundationPage>
  ),
});
