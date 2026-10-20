import { IconCheck, IconClock } from '@tabler/icons-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { INTENTS } from '~/components/ui/intent-variants';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

import { BadgeCategories } from '../examples/badge/categories';
import { BadgeDataColor } from '../examples/badge/data-color';
import { BadgeDefault } from '../examples/badge/default';
import { BadgeShapes } from '../examples/badge/shapes';
import { BadgeSizes } from '../examples/badge/sizes';
import { BadgeStatus } from '../examples/badge/status';
import { BadgeVariants } from '../examples/badge/intent-and-emphasis';
import { BadgeWithCount } from '../examples/badge/with-count';
import { BadgeWithIcon } from '../examples/badge/with-icon';
import { Code, ExampleSection, FoundationPage, FoundationSection, Matrix } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const EMPHASES = ['subtle', 'solid', 'outline'] as const;
const SIZES = [
  { size: 'default', height: 24 },
  { size: 'sm', height: 20 },
] as const;

const DATA_COLORS = [
  { name: 'category-1', color: 'var(--category-1)', label: 'Design' },
  { name: 'category-2', color: 'var(--category-2)', label: 'Events' },
  { name: 'category-5', color: 'var(--category-5)', label: 'Hiring' },
  { name: '#0ea5e9', color: '#0ea5e9', label: 'Backend' },
] as const;

const LABEL = {
  neutral: 'Draft',
  primary: 'Selected',
  info: 'New',
  success: 'Done',
  warning: 'Blocked',
  destructive: 'Overdue',
} as const;

export default defineDocs({
  title: 'Badge',
  description: 'A state or a count, named in words.',
  group: 'Components',
  playground: {
    component: Badge,
    args: { children: 'Done', intent: 'success' },
    argTypes: {
      intent: { control: 'select', options: INTENTS },
      emphasis: { control: 'select', options: ['subtle', 'solid', 'outline'] },
      size: { control: 'select', options: ['default', 'sm'] },
      shape: { control: 'select', options: ['rounded', 'pill'] },
    },
  },
  Page: () => (
    <FoundationPage
      title='Badge'
      description='A state or a count, named in words. An intent at subtle (the default), solid when it needs action, outline in dense lists. Pill for counts and chips. A color from data takes color instead of intent.'>
      <ExampleSection title='Default'>
        <BadgeDefault />
      </ExampleSection>
      <ExampleSection
        title='Intent and emphasis'
        description='An intent at subtle (the default); solid when it needs action, outline in dense lists.'>
        <BadgeVariants />
      </ExampleSection>
      <ExampleSection title='Status' description='One intent per state.'>
        <BadgeStatus />
      </ExampleSection>
      <ExampleSection
        title='Data color'
        description='A color the workspace picked (a label, a category) is data, not an intent: pass it as color instead of intent. Every emphasis paints from it, in both modes.'>
        <BadgeDataColor />
      </ExampleSection>
      <ExampleSection title='Categories' description='Without a picked color, take the categories in order.'>
        <BadgeCategories />
      </ExampleSection>
      <ExampleSection title='Sizes' description='24px; sm (20px) for a count in a dense row.'>
        <BadgeSizes />
      </ExampleSection>
      <ExampleSection title='Shapes' description='Rounded for a state; pill for a count or a filter chip.'>
        <BadgeShapes />
      </ExampleSection>
      <ExampleSection title='With icon'>
        <BadgeWithIcon />
      </ExampleSection>
      <ExampleSection title='With count'>
        <BadgeWithCount />
      </ExampleSection>

      <FoundationSection title='Intent × emphasis'>
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
        title='Data color × emphasis'
        description='Solid is the color with black or white text by its lightness; subtle and outline mix it toward the text color.'>
        <Matrix
          columns={EMPHASES}
          rows={DATA_COLORS.map(({ name, color, label }) => ({
            name,
            cells: EMPHASES.map((emphasis) => (
              <Badge key={emphasis} color={color} emphasis={emphasis}>
                {label}
              </Badge>
            )),
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Size × shape' description='Caption text at both sizes; corners rounded-control-sm.'>
        <Matrix
          columns={['rounded', 'pill', 'with icon']}
          rows={SIZES.map(({ size, height }) => ({
            name: size,
            meta: <Code>{`${height}px`}</Code>,
            cells: [
              <Badge key='r' size={size} intent='success'>
                Done
              </Badge>,
              <Badge key='p' size={size} shape='pill'>
                12
              </Badge>,
              <Badge key='i' size={size} intent='warning'>
                <IconClock />
                Blocked
              </Badge>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Usages'>
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Publish the pricing page</ItemTitle>
                  <ItemDescription>Website redesign · closed Mar 12</ItemDescription>
                </ItemContent>
                <Badge intent='success'>
                  <IconCheck />
                  Done
                </Badge>
              </Item>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Sign the vendor contract</ItemTitle>
                  <ItemDescription>Operations · waiting on legal</ItemDescription>
                </ItemContent>
                <Badge intent='warning' emphasis='solid'>
                  Needs review
                </Badge>
              </Item>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Comments</ItemTitle>
                  <ItemDescription>Unread</ItemDescription>
                </ItemContent>
                <Badge intent='primary' emphasis='solid' shape='pill' size='sm'>
                  3
                </Badge>
              </Item>
            </ItemList>
          </CardContent>
        </Card>
      </FoundationSection>
    </FoundationPage>
  ),
});
