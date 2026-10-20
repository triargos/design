import { Callout, CalloutContent } from '~/components/ui/callout';

import { CalloutDefault } from '../examples/callout/default';
import { CalloutInASection } from '../examples/callout/in-a-section';
import { CalloutVariants } from '../examples/callout/intents';
import { CalloutWithAction } from '../examples/callout/with-action';
import { CalloutWithTitle } from '../examples/callout/with-title';
import { ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const INTENTS = [
  {
    intent: 'info',
    use: 'Default. Plain information: how something works, what happens next.',
    title: 'New fields available',
    body: 'Members see them after their next sign-in.',
  },
  {
    intent: 'success',
    use: 'A finished step the user should know about.',
    title: 'Import finished',
    body: '248 tasks were added to the project.',
  },
  {
    intent: 'warning',
    use: 'Needs attention, but nothing is broken yet.',
    title: 'Your trial ends on March 31',
    body: 'Add a payment method to keep your projects.',
  },
  {
    intent: 'destructive',
    use: 'Something failed or will be lost.',
    title: 'Sync failed',
    body: '3 documents could not be uploaded.',
  },
  {
    intent: 'neutral',
    use: 'An aside that is not news, inside a dense surface.',
    title: 'Only admins see this section',
    body: 'Members cannot open it.',
  },
] as const;

export default defineDocs({
  title: 'Callout',
  description: 'An inline notice; the intent says what kind.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Callout'
      description='An inline notice. Text only: the intent says what kind of notice it is, the first line says the rest. Always the subtle emphasis of its intent.'>
      <ExampleSection title='Default' description='Info, body only.'>
        <CalloutDefault />
      </ExampleSection>
      <ExampleSection title='Intents' description='The intent’s subtle fill and its text; no edge, no icon.'>
        <CalloutVariants />
      </ExampleSection>
      <ExampleSection
        title='With title'
        description='Title and body lines sit flush; the line height is the gap. The title is font-medium and keeps the intent color.'>
        <CalloutWithTitle />
      </ExampleSection>
      <ExampleSection
        title='With action'
        description='One 40px raised button, 6px from the edge on every side; rounded-inner keeps its corners concentric. Below sm the action stacks under the text.'>
        <CalloutWithAction />
      </ExampleSection>
      <ExampleSection
        title='In a section'
        description='A callout sits between cards, one group step apart. Its text starts 20px in, on the edge of the section title and the card headers.'
        bare>
        <CalloutInASection />
      </ExampleSection>

      <FoundationSection title='When to use' description='Each intent and what it is for.'>
        <SpecimenList>
          {INTENTS.map(({ intent, use, title, body }) => (
            <SpecimenRow key={intent} name={intent} meta={use}>
              <Callout intent={intent}>
                <CalloutContent>
                  <p className='font-medium'>{title}</p>
                  <p>{body}</p>
                </CalloutContent>
              </Callout>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
});
