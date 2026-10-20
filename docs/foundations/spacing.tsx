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
  PageHeaderBackLink,
  PageHeaderGroup,
  PageSection,
  PageTitle,
} from '~/components/ui/page-header';

import { Code, FoundationPage, FoundationSection, GapRuler, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs, useTokens } from '../kit/docs';
import { SPACING_STEPS, type SpacingStepName, spacingValue } from '../kit/tokens';

const usage: Record<SpacingStepName, { relation: string; owners: string }> = {
  tight: {
    relation: 'A title and its description: one unit',
    owners: 'PageHeaderGroup, PageSection (title → description), ItemContent, FieldContent, DialogHeader, EmptyState',
  },
  related: { relation: 'Items that work together', owners: 'Field (label → control), PageHeaderActions, ItemActions' },
  group: {
    relation: 'Peer blocks; a heading → its content; padding inside a surface',
    owners:
      'PageContent (back link → title), PageSection, FieldGroup, FieldSet, FieldLegend, InsetCardContent, InsetCardHeader (inline), DialogBody, SheetBody',
  },
  page: { relation: 'Page title → content', owners: 'PageContent' },
  section: { relation: 'Section ↔ section', owners: 'PageContent (around a PageSection)' },
};

const Row = ({ name, detail }: { name: string; detail: string }) => (
  <Item>
    <ItemContent>
      <ItemTitle>{name}</ItemTitle>
      <ItemDescription>{detail}</ItemDescription>
    </ItemContent>
    <Badge intent='success'>Active</Badge>
  </Item>
);

const SamplePage = () => (
  <div className='rounded-3xl bg-background px-5 pt-10 pb-10 ring-1 ring-border/50 md:px-10'>
    <PageContent
      header={
        <>
          <PageHeaderBackLink href='/'>Projects</PageHeaderBackLink>
          <PageHeaderGroup>
            <PageTitle>Website redesign</PageTitle>
            <PageDescription>Review the details before you share the project with the team.</PageDescription>
          </PageHeaderGroup>
        </>
      }>
      <Callout>
        <CalloutContent>
          <p className='font-medium'>Due March 31</p>
          <p>After that, the project moves to review.</p>
        </CalloutContent>
      </Callout>
      <PageSection title='Team' description='Only admins see these details.'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Members</InsetCardTitle>
            <InsetCardDescription>They get every project update.</InsetCardDescription>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Row name='Anna Schmidt' detail='anna@example.com' />
              <Row name='Jonas Weber' detail='jonas@example.com' />
            </ItemList>
          </InsetCardContent>
        </InsetCard>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Owner</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Row name='Mia Chen' detail='Project lead' />
            </ItemList>
          </InsetCardContent>
        </InsetCard>
      </PageSection>
      <PageSection title='Documents'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Files</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Row name='project-brief.pdf' detail='Uploaded March 12' />
            </ItemList>
          </InsetCardContent>
        </InsetCard>
      </PageSection>
    </PageContent>
  </div>
);

export default defineDocs({
  title: 'Spacing',
  description: 'Five steps, named by relationship.',
  group: 'Foundations',
  Page: () => {
    const gaps = true;
    const globals = useTokens();
    return (
      <FoundationPage
        title='Spacing'
        description='Five steps, named by relationship. Peer blocks and a heading and its content share one gap; sections sit three times as far apart (48), and the page header between the two (32). Padding inside rows and controls follows their height (Shape), not this scale.'>
        <FoundationSection
          title='Scale'
          description='Each gap is drawn at its real size. Tune the steps in Customize; every page follows.'>
          <SpecimenList>
            {SPACING_STEPS.map((step) => (
              <SpecimenRow
                key={step.name}
                name={step.name}
                meta={
                  <>
                    {spacingValue(globals, step)}px
                    {spacingValue(globals, step) !== step.px && ` (default ${step.px})`} · gap-{step.name}, p-
                    {step.name}
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
          description='PageContent, PageSection and InsetCard place every gap; the page writes none.'>
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
                    <InsetCardTitle>Contact</InsetCardTitle>
                    <InsetCardDescription>How your team reaches you.</InsetCardDescription>
                  </InsetCardHeader>
                  <InsetCardContent className='p-4'>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='spacing-email'>Email</FieldLabel>
                        <Input id='spacing-email' defaultValue='anna@example.com' />
                        <FieldDescription>For confirmations and questions.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor='spacing-phone'>Phone</FieldLabel>
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
                  <EmptyStateTitle>No projects yet</EmptyStateTitle>
                  <EmptyStateDescription>Projects you create show up here.</EmptyStateDescription>
                  <EmptyStateContent>
                    <Button>New project</Button>
                  </EmptyStateContent>
                </EmptyState>
              </GapRuler>
            </SpecimenRow>
          </SpecimenList>
        </FoundationSection>
      </FoundationPage>
    );
  },
});
