import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Alert, AlertContent } from '~/components/ui/alert';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { PageContent } from '../kit/page-layout';
import { PageDescription, PageHeaderBackLink, PageHeaderGroup, PageSection, PageTitle } from '../kit/page-layout';

import { Code, FoundationPage, FoundationSection, GapRuler, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs, useTokens } from '../kit/docs';
import { SPACING_STEPS, type SpacingStepName, spacingValue } from '../kit/tokens';

const usage: Record<SpacingStepName, { relation: string; owners: string }> = {
  tight: {
    relation: 'A title and its description: one unit',
    owners: 'Page header and section titles (title → description), ItemContent, FieldContent, DialogHeader, Empty',
  },
  related: {
    relation: 'Items that work together',
    owners: 'Field (label → control), page header actions, ItemActions',
  },
  part: {
    relation:
      'The parts of one component: a media or indicator and its text, text and its action, a label beside its control',
    owners: 'Alert, horizontal Field, Stepper, Progress, Empty media, chart legend, stacked toasts',
  },
  group: {
    relation: 'Peer blocks; a heading → its content; padding inside a dialog or sheet',
    owners:
      'Page header (back link → title), sections, FieldGroup, FieldSet, FieldLegend, CardHeader (top and bottom), DialogBody, SheetBody',
  },
  card: {
    relation: 'Padding inside a card; its header, footer and flush rows on the same edge',
    owners: 'CardContent, CardHeader, CardFooter, ItemList rows, Table card and flush edges',
  },
  page: { relation: 'Page title → content', owners: 'Page pattern' },
  section: { relation: 'Section ↔ section', owners: 'Page pattern (between sections)' },
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
      <Alert>
        <AlertContent>
          <p className='font-medium'>Due March 31</p>
          <p>After that, the project moves to review.</p>
        </AlertContent>
      </Alert>
      <PageSection title='Team' description='Only admins see these details.'>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>They get every project update.</CardDescription>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList>
              <Row name='Anna Schmidt' detail='anna@example.com' />
              <Row name='Jonas Weber' detail='jonas@example.com' />
            </ItemList>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Owner</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList>
              <Row name='Mia Chen' detail='Project lead' />
            </ItemList>
          </CardContent>
        </Card>
      </PageSection>
      <PageSection title='Documents'>
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList>
              <Row name='project-brief.pdf' detail='Uploaded March 12' />
            </ItemList>
          </CardContent>
        </Card>
      </PageSection>
    </PageContent>
  </div>
);

export default defineDocs({
  title: 'Spacing',
  description: 'Seven steps, named by relationship.',
  group: 'Foundations',
  Page: () => {
    const gaps = true;
    const globals = useTokens();
    return (
      <FoundationPage
        title='Spacing'
        description='Seven steps, named by relationship. Peer blocks and a heading and its content share one gap; sections sit three times as far apart (48), and the page header between the two (32). Padding inside rows and controls follows the sizing tokens (Sizing), not this scale.'>
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
          description='Components place every gap inside them; the page layout (the Page pattern) places the gaps between them.'>
          <GapRuler show={gaps}>
            <SamplePage />
          </GapRuler>
        </FoundationSection>

        <FoundationSection title='Components' description='Inside the main components.'>
          <SpecimenList>
            <SpecimenRow name='Form card' meta={<Code>CardHeader · FieldGroup · Field · FieldContent</Code>}>
              <GapRuler show={gaps}>
                <Card className='max-w-lg'>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                    <CardDescription>How your team reaches you.</CardDescription>
                  </CardHeader>
                  <CardContent className='p-4'>
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
                  </CardContent>
                </Card>
              </GapRuler>
            </SpecimenRow>
            <SpecimenRow name='Empty state' meta={<Code>media → title 16 · title → description 4 · → actions 24</Code>}>
              <GapRuler show={gaps}>
                <Empty>
                  <EmptyMedia />
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptyDescription>Projects you create show up here.</EmptyDescription>
                  <EmptyContent>
                    <Button>New project</Button>
                  </EmptyContent>
                </Empty>
              </GapRuler>
            </SpecimenRow>
          </SpecimenList>
        </FoundationSection>
      </FoundationPage>
    );
  },
});
