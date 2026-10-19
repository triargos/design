import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Callout, CalloutContent } from '~/components/ui/callout';
import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from '~/components/ui/empty-state';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { PageContent } from '~/components/ui/page-content';
import {
  PageDescription,
  PageHeader,
  PageHeaderBackLink,
  PageHeaderGroup,
  PageHeaderSection,
  PageSection,
} from '~/components/ui/page-header';

import { Code, FoundationPage, FoundationSection, GapRuler, SpecimenList, SpecimenRow } from '../kit/blocks';
import { SPACING_STEPS, type SpacingStepName, spacingValue } from '../kit/tokens';

interface SpacingArgs {
  gaps: boolean;
}

const meta = {
  title: 'Foundations/Spacing',
  parameters: { frame: 'page' },
  args: { gaps: true },
  argTypes: { gaps: { name: 'Show gaps', control: 'boolean' } },
} satisfies Meta<SpacingArgs>;

export default meta;

type Story = StoryObj<SpacingArgs>;

const usage: Record<SpacingStepName, { relation: string; owners: string }> = {
  tight: {
    relation: 'A title and its description: one unit',
    owners: 'PageHeaderGroup, SectionHeaderGroup, ItemContent, FieldContent, DialogHeader, EmptyState',
  },
  related: { relation: 'Items that work together', owners: 'Field (label → control), PageHeaderTools, ItemActions' },
  group: {
    relation: 'Peer blocks; a heading → its content; padding inside a surface',
    owners:
      'PageContent, PageSection, FieldGroup, FieldSet, PageHeaderSection (back link → title), FieldLegend, InsetCardContent, InsetCardHeader (inline), DialogBody, SheetBody',
  },
  page: { relation: 'Page title → content', owners: 'PageContent' },
  section: { relation: 'Section ↔ section', owners: 'PageContent (around a PageSection)' },
};

const Guardian = ({ name, detail }: { name: string; detail: string }) => (
  <Item>
    <ItemContent>
      <ItemTitle>{name}</ItemTitle>
      <ItemDescription>{detail}</ItemDescription>
    </ItemContent>
    <Badge variant='success'>Bestätigt</Badge>
  </Item>
);

const SamplePage = () => (
  <div className='rounded-3xl bg-background px-5 pt-10 pb-10 ring-1 ring-border/50 md:px-10'>
    <PageContent
      header={
        <PageHeaderSection>
          <PageHeaderBackLink to='/'>Anmeldungen</PageHeaderBackLink>
          <PageHeaderGroup>
            <PageHeader>Anmeldung zur Nachmittagsbetreuung</PageHeader>
            <PageDescription>Prüfen Sie die Angaben, bevor Sie die Anmeldung absenden.</PageDescription>
          </PageHeaderGroup>
        </PageHeaderSection>
      }>
      <Callout>
        <CalloutContent>
          <p className='font-medium'>Frist bis 31. März</p>
          <p>Danach meldet sich die Schule bei Ihnen.</p>
        </CalloutContent>
      </Callout>
      <PageSection title='Familie' description='Diese Angaben sieht nur die Schulleitung.'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Erziehungsberechtigte</InsetCardTitle>
            <InsetCardDescription>Erhalten alle Nachrichten der Schule.</InsetCardDescription>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Guardian name='Anna Schmidt' detail='anna.schmidt@example.de' />
              <Guardian name='Jonas Schmidt' detail='jonas.schmidt@example.de' />
            </ItemList>
          </InsetCardContent>
        </InsetCard>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Kinder</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Guardian name='Mia Schmidt' detail='Klasse 3b' />
            </ItemList>
          </InsetCardContent>
        </InsetCard>
      </PageSection>
      <PageSection title='Dokumente'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Nachweise</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Guardian name='Arbeitgeberbescheinigung.pdf' detail='Hochgeladen am 12. März' />
            </ItemList>
          </InsetCardContent>
        </InsetCard>
      </PageSection>
    </PageContent>
  </div>
);

export const Spacing: Story = {
  render: ({ gaps }, { globals }) => (
    <FoundationPage
      title='Spacing'
      description='Five steps, named by relationship. Peer blocks and a heading and its content share one gap; sections sit three times as far apart (48), and the page header between the two (32). Padding inside rows and controls follows their height (Shape), not this scale.'>
      <FoundationSection
        title='Scale'
        description='Each gap is drawn at its real size. Tune the steps in the Tokens panel; every story follows.'>
        <SpecimenList>
          {SPACING_STEPS.map((step) => (
            <SpecimenRow
              key={step.name}
              name={step.name}
              meta={
                <>
                  {spacingValue(globals, step)}px
                  {spacingValue(globals, step) !== step.px && ` (default ${step.px})`} · gap-{step.name}, p-{step.name}
                  <br />
                  {usage[step.name].relation}
                  <br />
                  <Code>{usage[step.name].owners}</Code>
                </>
              }>
              <div className='flex max-w-md flex-col'>
                <div className='h-6 rounded-lg bg-muted' />
                <div className='bg-primary/20' style={{ height: `var(--spacing-${step.name})` }} />
                <div className='h-6 rounded-lg bg-muted' />
              </div>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>

      <FoundationSection
        title='Page'
        description='PageContent, PageSection and InsetCard place every gap; the page writes none. Turn off “Show gaps” in the controls to see it plain.'>
        <GapRuler show={gaps}>
          <SamplePage />
        </GapRuler>
      </FoundationSection>

      <FoundationSection title='Components' description='Inside the main components.'>
        <SpecimenList>
          <SpecimenRow name='Form card' meta={<Code>InsetCardHeader · FieldGroup · Field · FieldContent</Code>}>
            <GapRuler show={gaps}>
              <InsetCard className='max-w-lg'>
                <InsetCardHeader>
                  <InsetCardTitle>Kontakt</InsetCardTitle>
                  <InsetCardDescription>So erreicht Sie die Schule.</InsetCardDescription>
                </InsetCardHeader>
                <InsetCardContent className='p-4'>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor='spacing-email'>E-Mail</FieldLabel>
                      <Input id='spacing-email' defaultValue='anna.schmidt@example.de' />
                      <FieldDescription>Für Bestätigungen und Rückfragen.</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor='spacing-phone'>Telefon</FieldLabel>
                      <Input id='spacing-phone' placeholder='Optional' />
                    </Field>
                  </FieldGroup>
                </InsetCardContent>
              </InsetCard>
            </GapRuler>
          </SpecimenRow>
          <SpecimenRow name='Empty state' meta={<Code>media → title 16 · title → description 4 · → actions 24</Code>}>
            <GapRuler show={gaps}>
              <EmptyState>
                <EmptyStateTitle>Noch keine Anmeldungen</EmptyStateTitle>
                <EmptyStateDescription>Sobald eine Familie sich anmeldet, erscheint sie hier.</EmptyStateDescription>
                <EmptyStateContent>
                  <Button type='button' variant='secondary'>
                    Link teilen
                  </Button>
                </EmptyStateContent>
              </EmptyState>
            </GapRuler>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};
