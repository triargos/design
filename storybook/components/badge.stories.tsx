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
import { Code, ExampleSection, FoundationPage, FoundationSection, Matrix } from '../kit/blocks';

const meta = {
  title: 'Components/Badge',
  parameters: { description: 'A state or a count, named in words.' },
  component: Badge,
  args: { children: 'Done', intent: 'success' },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    emphasis: { control: 'select', options: ['subtle', 'solid', 'outline'] },
    size: { control: 'select', options: ['default', 'sm'] },
    shape: { control: 'select', options: ['rounded', 'pill'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

const EMPHASES = ['subtle', 'solid', 'outline'] as const;
const SIZES = [
  { size: 'default', height: 24 },
  { size: 'sm', height: 20 },
] as const;

const LABEL = {
  neutral: 'Draft',
  primary: 'Selected',
  info: 'New',
  success: 'Done',
  warning: 'Blocked',
  destructive: 'Overdue',
} as const;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Badge'
      description='A state or a count, named in words. An intent at subtle (the default), solid when it needs action, outline in dense lists. Pill for counts and chips.'>
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
                <ClockIcon />
                Blocked
              </Badge>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Usages'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Tasks</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='overflow-hidden'>
            <ItemList>
              <Item className='px-4'>
                <ItemContent>
                  <ItemTitle>Publish the pricing page</ItemTitle>
                  <ItemDescription>Website redesign · closed Mar 12</ItemDescription>
                </ItemContent>
                <Badge intent='success'>
                  <CheckIcon />
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
