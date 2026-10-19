import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, ClockIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { INTENTS } from '~/components/ui/intent-variants';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

import { BadgeDefault } from '../examples/badge/default';
import { BadgeShapes } from '../examples/badge/shapes';
import { BadgeSizes } from '../examples/badge/sizes';
import { BadgeStatus } from '../examples/badge/status';
import { BadgeVariants } from '../examples/badge/variants';
import { BadgeWithCount } from '../examples/badge/with-count';
import { BadgeWithIcon } from '../examples/badge/with-icon';
import {
  Code,
  ExampleSection,
  FoundationPage,
  FoundationSection,
  Matrix,
  SpecimenList,
  SpecimenRow,
} from '../kit/blocks';

const meta = {
  title: 'Components/Badge',
  parameters: { description: 'A state or a count, named in words.' },
  component: Badge,
  args: { children: 'Genehmigt', intent: 'success' },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

const EMPHASES = ['subtle', 'solid', 'outline'] as const;
const SIZES = [
  { size: 'sm', height: 20 },
  { size: 'md', height: 24 },
  { size: 'lg', height: 28 },
  { size: 'xl', height: 32 },
] as const;

const LABEL = {
  neutral: 'Entwurf',
  primary: 'Ausgewählt',
  info: 'Neu',
  success: 'Genehmigt',
  warning: 'Ausstehend',
  destructive: 'Abgelehnt',
} as const;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Badge'
      description='A state or a count, named in words. An intent at subtle (the default), solid when it needs action, outline in dense lists. Corners follow the height, as on a button; pill for counts and chips.'>
      <ExampleSection title='Default'>
        <BadgeDefault />
      </ExampleSection>
      <ExampleSection
        title='Variants'
        description='An intent at subtle (the default); solid when it needs action, outline in dense lists.'>
        <BadgeVariants />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description='20 / 24 / 28 / 32px. Text sizes follow the height: caption to 24px, control from 28px.'>
        <BadgeSizes />
      </ExampleSection>
      <ExampleSection
        title='Shapes'
        description='Corners follow the height, as on a button; pill for counts and chips.'>
        <BadgeShapes />
      </ExampleSection>
      <ExampleSection title='With icon'>
        <BadgeWithIcon />
      </ExampleSection>
      <ExampleSection title='With count'>
        <BadgeWithCount />
      </ExampleSection>
      <ExampleSection
        title='Status'
        description='The old variant names keep their pill shape and height until the app migrates.'>
        <BadgeStatus />
      </ExampleSection>

      <FoundationSection title='Intent × emphasis' description='At md, the default size.'>
        <Matrix
          columns={EMPHASES}
          rows={INTENTS.map((intent) => ({
            name: intent,
            cells: EMPHASES.map((emphasis) => (
              <Badge key={emphasis} intent={intent} emphasis={emphasis}>
                {LABEL[intent]}
              </Badge>
            )),
          }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Sizes and shape'
        description='Text sizes follow the height: caption to 24px, control from 28px.'>
        <Matrix
          columns={['rounded', 'pill', 'with icon']}
          rows={SIZES.map(({ size, height }) => ({
            name: size,
            meta: <Code>{`${height}px`}</Code>,
            cells: [
              <Badge key='r' size={size} intent='success'>
                Genehmigt
              </Badge>,
              <Badge key='p' size={size} shape='pill' intent='neutral'>
                12
              </Badge>,
              <Badge key='i' size={size} intent='warning'>
                <ClockIcon />
                Ausstehend
              </Badge>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Aliases'
        description='The old variant names keep their pill shape and height until the app migrates.'>
        <SpecimenList>
          <SpecimenRow name='Status' meta={<Code>success · warning · info · danger · muted</Code>}>
            <div className='flex flex-wrap gap-related'>
              <Badge variant='success'>Genehmigt</Badge>
              <Badge variant='warning'>Ausstehend</Badge>
              <Badge variant='info'>Neu</Badge>
              <Badge variant='danger'>Abgelehnt</Badge>
              <Badge variant='muted'>Entwurf</Badge>
            </div>
          </SpecimenRow>
          <SpecimenRow name='Neutral' meta={<Code>default · secondary · outline · destructive · ghost</Code>}>
            <div className='flex flex-wrap gap-related'>
              <Badge variant='default'>Standard</Badge>
              <Badge variant='secondary'>Sekundär</Badge>
              <Badge variant='outline'>Kontur</Badge>
              <Badge variant='destructive'>Fehler</Badge>
              <Badge variant='ghost'>Leise</Badge>
            </div>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>

      <FoundationSection title='Usages'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Anmeldungen</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Mia Schmidt</ItemTitle>
                  <ItemDescription>Klasse 3b · eingereicht am 12. März</ItemDescription>
                </ItemContent>
                <Badge intent='success'>
                  <CheckIcon />
                  Genehmigt
                </Badge>
              </Item>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Leon Weber</ItemTitle>
                  <ItemDescription>Klasse 1a · Unterlagen fehlen</ItemDescription>
                </ItemContent>
                <Badge intent='warning' emphasis='solid'>
                  Aktion nötig
                </Badge>
              </Item>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Nachrichten</ItemTitle>
                  <ItemDescription>Ungelesen</ItemDescription>
                </ItemContent>
                <Badge intent='primary' emphasis='solid' shape='pill' size='sm'>
                  3
                </Badge>
              </Item>
            </ItemList>
          </InsetCardContent>
        </InsetCard>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Playground: Story = {};
export const Default: Story = { render: () => <BadgeDefault /> };
export const Variants: Story = { render: () => <BadgeVariants /> };
export const Sizes: Story = { render: () => <BadgeSizes /> };
export const Shapes: Story = { render: () => <BadgeShapes /> };
export const WithIcon: Story = {
  name: 'With icon',
  render: () => <BadgeWithIcon />,
};
export const WithCount: Story = {
  name: 'With count',
  render: () => <BadgeWithCount />,
};
export const Status: Story = { render: () => <BadgeStatus /> };
