import type { Meta, StoryObj } from '@storybook/react-vite';

import { Callout, CalloutContent } from '~/components/ui/callout';

import { CalloutDefault } from '../examples/callout/default';
import { CalloutInASection } from '../examples/callout/in-a-section';
import { CalloutVariants } from '../examples/callout/variants';
import { CalloutWithAction } from '../examples/callout/with-action';
import { CalloutWithTitle } from '../examples/callout/with-title';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';

const meta = {
  title: 'Components/Callout',
  parameters: { description: 'An inline notice; the intent says what kind.' },
  component: Callout,
} satisfies Meta<typeof Callout>;

export default meta;

type Story = StoryObj<typeof meta>;

const INTENTS = [
  {
    intent: 'info',
    use: 'Default. Plain information: how something works, what happens next.',
    title: 'Neue Felder verfügbar',
    body: 'Eltern sehen die Änderungen ab dem nächsten Schuljahr.',
  },
  {
    intent: 'success',
    use: 'A finished step the user should know about.',
    title: 'Import abgeschlossen',
    body: '248 Familien wurden übernommen.',
  },
  {
    intent: 'warning',
    use: 'Needs attention, but nothing is broken yet.',
    title: 'Frist bis 31. März',
    body: 'Danach können Eltern keine Anträge mehr stellen.',
  },
  {
    intent: 'destructive',
    use: 'Something failed or will be lost.',
    title: 'Synchronisierung fehlgeschlagen',
    body: '3 Dateien konnten nicht übertragen werden.',
  },
  {
    intent: 'neutral',
    use: 'An aside that is not news, inside a dense surface.',
    title: 'Nur für die Schulleitung sichtbar',
    body: 'Lehrkräfte sehen diesen Bereich nicht.',
  },
] as const;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Callout'
      description='An inline notice. Text only: the intent says what kind of notice it is, the first line says the rest. Always the subtle emphasis of its intent.'>
      <ExampleSection title='Default' description='Info, body only.'>
        <CalloutDefault />
      </ExampleSection>
      <ExampleSection
        title='Variants'
        description={
          <>
            The intent’s subtle fill and its text; no edge, no icon. The old <Code>tone='danger'</Code> is{' '}
            <Code>intent='destructive'</Code>.
          </>
        }>
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
};

export const Default: Story = { render: () => <CalloutDefault /> };
export const Variants: Story = { render: () => <CalloutVariants /> };
export const WithTitle: Story = {
  name: 'With title',
  render: () => <CalloutWithTitle />,
};
export const WithAction: Story = {
  name: 'With action',
  render: () => <CalloutWithAction />,
};
export const InASection: Story = {
  name: 'In a section',
  render: () => <CalloutInASection />,
};
