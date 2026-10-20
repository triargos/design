import { IconArrowRight, IconDots, IconPencil, IconPlus } from '@tabler/icons-react';
import { type ReactNode } from 'react';

import { Button, type ButtonProps } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { EMPHASES, INTENTS } from '~/components/ui/intent-variants';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

import { cn } from '~/lib/utils';

import { ButtonAsLink } from '../examples/button/as-link';
import { ButtonDefault } from '../examples/button/default';
import { ButtonDisabled } from '../examples/button/disabled';
import { ButtonIconOnly } from '../examples/button/icon-only';
import { ButtonOpen } from '../examples/button/open';
import { ButtonPending } from '../examples/button/pending';
import { ButtonPressed } from '../examples/button/pressed';
import { ButtonSizes } from '../examples/button/sizes';
import { ButtonVariants } from '../examples/button/intent-and-emphasis';
import { ButtonWithIcon } from '../examples/button/with-icon';
import {
  Code,
  ExampleSection,
  FoundationPage,
  FoundationSection,
  Matrix,
  Preview,
  SpecimenList,
  SpecimenRow,
} from '../kit/blocks';
import { defineDocs } from '../kit/docs';
import { Inline, Stack } from '../kit/stack';

type Size = NonNullable<ButtonProps['size']>;

const TEXT_SIZES: ReadonlyArray<{ size: Size; height: number; radius: string }> = [
  { size: 'xs', height: 32, radius: 'control' },
  { size: 'default', height: 36, radius: 'control' },
  { size: 'lg', height: 40, radius: 'control-lg' },
];

const ICON_SIZES: ReadonlyArray<Size> = ['icon-xs', 'icon', 'icon-lg'];

/** The pairs to reach for, with the props that select each one. */
const PAIRS: ReadonlyArray<{
  intent: NonNullable<ButtonProps['intent']>;
  emphasis: NonNullable<ButtonProps['emphasis']>;
  props: string;
  use: string;
}> = [
  {
    intent: 'primary',
    emphasis: 'solid',
    props: "intent='primary'",
    use: 'The one main action of a page, card or dialog.',
  },
  {
    intent: 'neutral',
    emphasis: 'raised',
    props: 'no props',
    use: 'Every other action, on any surface; card header actions.',
  },
  { intent: 'neutral', emphasis: 'ghost', props: "emphasis='ghost'", use: 'Row, toolbar and close actions.' },
  {
    intent: 'destructive',
    emphasis: 'solid',
    props: "intent='destructive'",
    use: 'An irreversible action, inside its confirmation; every danger-zone action.',
  },
  {
    intent: 'destructive',
    emphasis: 'subtle',
    props: "intent='destructive' emphasis='subtle'",
    use: 'A destructive action that opens its confirmation, outside a danger zone.',
  },
];

function SurfaceSample({
  label,
  className,
  surface,
  children,
}: {
  label: string;
  className: string;
  surface?: 'card' | 'popup';
  children: ReactNode;
}) {
  return (
    <Stack gap='related'>
      <Code>{label}</Code>
      <div data-surface={surface} className={cn('rounded-card p-group', className)}>
        {children}
      </div>
    </Stack>
  );
}

function SurfaceColumn() {
  return (
    <Stack gap='related' align='start'>
      {PAIRS.map(({ intent, emphasis }) => (
        <Button key={`${intent}-${emphasis}`} intent={intent} emphasis={emphasis}>
          {intent}/{emphasis}
        </Button>
      ))}
    </Stack>
  );
}

export default defineDocs({
  title: 'Button',
  description: 'Runs an action: an intent at an emphasis, at a size.',
  group: 'Components',
  playground: {
    component: Button,
    args: { children: 'Edit project' },
    argTypes: {
      intent: { control: 'select', options: INTENTS },
      emphasis: { control: 'select', options: EMPHASES },
      size: { control: 'select', options: [...TEXT_SIZES.map(({ size }) => size), ...ICON_SIZES] },
    },
  },
  Page: () => (
    <FoundationPage
      title='Button'
      description='An intent (what the action means) at an emphasis (how much it weighs), at a size (where it sits). Without props a button is neutral/raised, every ordinary action. Five pairs cover every use; the matrix shows the rest of the grid they come from.'>
      <ExampleSection title='Default' description='No props: neutral/raised.'>
        <ButtonDefault />
      </ExampleSection>
      <ExampleSection title='Intent and emphasis' description='The five pairs. Pairs, below, says when each one fits.'>
        <ButtonVariants />
      </ExampleSection>
      <ExampleSection title='Sizes' description='32 / 36 / 40px; the default is the field height.'>
        <ButtonSizes />
      </ExampleSection>
      <ExampleSection
        title='With icon'
        description={
          <>
            <Code>data-icon='inline-start'</Code> or <Code>'inline-end'</Code> tightens the padding on that side.
          </>
        }>
        <ButtonWithIcon />
      </ExampleSection>
      <ExampleSection
        title='Icon only'
        description={
          <>
            The icon sizes match the text sizes. <Code>aria-label</Code> names the action.
          </>
        }>
        <ButtonIconOnly />
      </ExampleSection>
      <ExampleSection
        title='As link'
        description={
          <>
            <Code>render</Code> swaps the element, e.g. for a router link.
          </>
        }>
        <ButtonAsLink />
      </ExampleSection>
      <ExampleSection
        title='Open'
        description={
          <>
            <Code>aria-expanded</Code> while the menu it opens is open.
          </>
        }>
        <ButtonOpen />
      </ExampleSection>
      <ExampleSection
        title='Pressed'
        description={
          <>
            Ghost + <Code>aria-pressed</Code>, in a muted toolbar.
          </>
        }>
        <ButtonPressed />
      </ExampleSection>
      <ExampleSection
        title='Pending'
        description={
          <>
            <Code>isLoading</Code>: the label keeps the width; the spinner shows at least 800ms. The last one resolves
            after 150ms and still never flashes; while pending it takes no second click.
          </>
        }>
        <ButtonPending />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <ButtonDisabled />
      </ExampleSection>

      <FoundationSection
        title='Pairs'
        description='Reach for these. emphasis defaults to raised for neutral and to solid for every other intent.'>
        <SpecimenList>
          {PAIRS.map(({ intent, emphasis, props, use }) => (
            <SpecimenRow
              key={`${intent}-${emphasis}`}
              name={`${intent} / ${emphasis}`}
              meta={
                <>
                  {use}
                  <br />
                  <Code>{props}</Code>
                </>
              }>
              <Inline wrap gap='related'>
                <Button intent={intent} emphasis={emphasis}>
                  Save
                </Button>
                <Button intent={intent} emphasis={emphasis}>
                  <IconPlus data-icon='inline-start' />
                  New task
                </Button>
                <Button intent={intent} emphasis={emphasis} size='icon' aria-label='More'>
                  <IconDots />
                </Button>
                <Button intent={intent} emphasis={emphasis} disabled>
                  Disabled
                </Button>
                <Button intent={intent} emphasis={emphasis} isLoading>
                  Save
                </Button>
              </Inline>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>

      <FoundationSection title='Intent × emphasis' description='Every combination at sm. Hover to see each state.'>
        <Matrix
          columns={EMPHASES}
          columnWidth='6.5rem'
          rows={INTENTS.map((intent) => ({
            name: intent,
            cells: EMPHASES.map((emphasis) => (
              <Button key={emphasis} intent={intent} emphasis={emphasis}>
                Action
              </Button>
            )),
          }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Size × emphasis'
        description='32 / 36 / 40px; the default is the field height. The radius follows the height; icon-only sizes match, so a row of both lines up. On touch, buttons under 44px get a 44px hit area.'>
        <Matrix
          columns={['primary/solid', 'neutral/raised', 'neutral/ghost', 'icon']}
          columnWidth='7rem'
          rows={TEXT_SIZES.map(({ size, height, radius }, index) => ({
            name: size,
            meta: <Code>{`${height}px · rounded-${radius}`}</Code>,
            cells: [
              <Button key='p' intent='primary' size={size}>
                Save
              </Button>,
              <Button key='r' size={size}>
                Next
                <IconArrowRight data-icon='inline-end' />
              </Button>,
              <Button key='g' emphasis='ghost' size={size}>
                <IconPlus data-icon='inline-start' />
                New
              </Button>,
              <Button key='i' size={ICON_SIZES[index]} aria-label='More'>
                <IconDots />
              </Button>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection title='On surfaces' description='The pairs on the page, a card shell, a card and a popup.'>
        <div className='grid gap-group md:grid-cols-2'>
          <SurfaceSample label='page' className='bg-background ring-1 ring-border'>
            <SurfaceColumn />
          </SurfaceSample>
          <SurfaceSample label='shell' className='bg-shell'>
            <SurfaceColumn />
          </SurfaceSample>
          <SurfaceSample label='card' surface='card' className='border border-(--edge) bg-card bg-clip-padding'>
            <SurfaceColumn />
          </SurfaceSample>
          <SurfaceSample
            label='popup'
            surface='popup'
            className='rounded-popup bg-popover text-popover-foreground shadow-popup'>
            <SurfaceColumn />
          </SurfaceSample>
        </div>
      </FoundationSection>

      <FoundationSection title='Usages' description='The pairs where they live.'>
        <div className='grid gap-group md:grid-cols-2'>
          <Preview title='Form footer' className='justify-end'>
            <Button>Cancel</Button>
            <Button intent='primary'>Save</Button>
          </Preview>
          <Preview title='Confirmation' className='justify-end'>
            <Button>Keep</Button>
            <Button intent='destructive'>Delete forever</Button>
          </Preview>
          <Card>
            <CardHeader
              actions={
                <Button size='icon-xs' aria-label='Edit'>
                  <IconPencil />
                </Button>
              }>
              <CardTitle>Card header action</CardTitle>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <ItemList>
                <Item className='px-4'>
                  <ItemContent>
                    <ItemTitle>Website redesign</ItemTitle>
                    <ItemDescription>Row actions: ghost</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button emphasis='ghost' size='icon-xs' aria-label='More'>
                      <IconDots />
                    </Button>
                  </ItemActions>
                </Item>
              </ItemList>
            </CardContent>
          </Card>
          <Preview title='Danger zone' className='justify-between'>
            <span className='text-body text-muted-foreground'>Delete the workspace and all its data</span>
            <Button intent='destructive'>Delete…</Button>
          </Preview>
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
});
