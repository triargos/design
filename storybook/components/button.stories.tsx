import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon, MoreHorizontalIcon, PencilIcon, PlusIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button, type ButtonProps } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle, cardSurface } from '~/components/ui/inset-card';
import { EMPHASES, INTENTS } from '~/components/ui/intent-variants';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

import { ButtonAsLink } from '../examples/button/as-link';
import { ButtonDefault } from '../examples/button/default';
import { ButtonDisabled } from '../examples/button/disabled';
import { ButtonIconOnly } from '../examples/button/icon-only';
import { ButtonOpen } from '../examples/button/open';
import { ButtonPending } from '../examples/button/pending';
import { ButtonPressed } from '../examples/button/pressed';
import { ButtonSizes } from '../examples/button/sizes';
import { ButtonVariants } from '../examples/button/variants';
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
import { Inline, Stack } from '../kit/stack';

type Size = NonNullable<ButtonProps['size']>;

const TEXT_SIZES: ReadonlyArray<{ size: Size; height: number; radius: string }> = [
  { size: 'xs', height: 32, radius: 'control' },
  { size: 'sm', height: 36, radius: 'control' },
  { size: 'default', height: 40, radius: 'control-lg' },
  { size: 'lg', height: 44, radius: 'control-lg' },
];

const ICON_SIZES: ReadonlyArray<Size> = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'];

/** The pairs to reach for, with the old `variant` each one replaces. */
const PAIRS: ReadonlyArray<{
  intent: ButtonProps['intent'];
  emphasis: ButtonProps['emphasis'];
  use: string;
  alias?: string;
}> = [
  { intent: 'primary', emphasis: 'solid', use: 'The one main action of a page, card or dialog.', alias: 'default' },
  {
    intent: 'neutral',
    emphasis: 'raised',
    use: 'Every other action, on any surface.',
    alias: 'secondary · outline · surface',
  },
  {
    intent: 'neutral',
    emphasis: 'ghost',
    use: 'Header, row, toolbar and close actions.',
    alias: 'ghost · muted · toolbar',
  },
  {
    intent: 'destructive',
    emphasis: 'solid',
    use: 'An irreversible action, inside its confirmation; every danger-zone action.',
    alias: 'destructive',
  },
  {
    intent: 'destructive',
    emphasis: 'subtle',
    use: 'A destructive action that opens its confirmation, outside a danger zone.',
  },
];

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    description: 'Runs an action: an intent (what it means) at an emphasis (how much it weighs), at a size.',
  },
  args: { type: 'button', children: 'Speichern', intent: 'primary', emphasis: 'solid' },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    emphasis: { control: 'select', options: EMPHASES },
    size: { control: 'select', options: [...TEXT_SIZES.map(({ size }) => size), ...ICON_SIZES] },
    variant: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

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
        <Button key={`${intent}-${emphasis}`} type='button' intent={intent} emphasis={emphasis} size='sm'>
          {intent}/{emphasis}
        </Button>
      ))}
    </Stack>
  );
}

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Button'
      description='An intent (what the action means) at an emphasis (how much it weighs), at a size (where it sits). Five pairs cover the app; the matrix shows the rest of the grid they come from.'>
      <ExampleSection title='Default'>
        <ButtonDefault />
      </ExampleSection>
      <ExampleSection
        title='Variants'
        description='The five pairs the app uses. Pairs, below, says when each one fits.'>
        <ButtonVariants />
      </ExampleSection>
      <ExampleSection title='Sizes' description='32 / 36 / 40 / 44px, the field heights.'>
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
            <Code>render</Code> swaps the element: a router Link in the app.
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
            after 150ms and still never flashes.
          </>
        }>
        <ButtonPending />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <ButtonDisabled />
      </ExampleSection>

      <FoundationSection title='Pairs' description='Reach for these. The old variant names still render as the pair.'>
        <SpecimenList>
          {PAIRS.map(({ intent, emphasis, use, alias }) => (
            <SpecimenRow
              key={`${intent}-${emphasis}`}
              name={`${intent} / ${emphasis}`}
              meta={
                <>
                  {use}
                  {alias !== undefined && (
                    <>
                      <br />
                      <Code>{`was variant='${alias}'`}</Code>
                    </>
                  )}
                </>
              }>
              <Inline wrap gap='related'>
                <Button type='button' intent={intent} emphasis={emphasis}>
                  Speichern
                </Button>
                <Button type='button' intent={intent} emphasis={emphasis}>
                  <PlusIcon data-icon='inline-start' />
                  Hinzufügen
                </Button>
                <Button type='button' intent={intent} emphasis={emphasis} size='icon' aria-label='Mehr'>
                  <MoreHorizontalIcon />
                </Button>
                <Button type='button' intent={intent} emphasis={emphasis} disabled>
                  Deaktiviert
                </Button>
                <Button type='button' intent={intent} emphasis={emphasis} isLoading>
                  Speichern
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
              <Button key={emphasis} type='button' intent={intent} emphasis={emphasis} size='sm'>
                Aktion
              </Button>
            )),
          }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Size × emphasis'
        description='32 / 36 / 40 / 44px, the field heights. The radius follows the height; icon-only sizes match, so a row of both lines up. On touch, buttons under 44px get a 44px hit area.'>
        <Matrix
          columns={['primary/solid', 'neutral/raised', 'neutral/ghost', 'icon']}
          columnWidth='7rem'
          rows={TEXT_SIZES.map(({ size, height, radius }, index) => ({
            name: size,
            meta: <Code>{`${height}px · rounded-${radius}`}</Code>,
            cells: [
              <Button key='p' type='button' size={size}>
                Speichern
              </Button>,
              <Button key='r' type='button' size={size} intent='neutral' emphasis='raised'>
                Weiter
                <ArrowRightIcon data-icon='inline-end' />
              </Button>,
              <Button key='g' type='button' size={size} intent='neutral' emphasis='ghost'>
                <PlusIcon data-icon='inline-start' />
                Neu
              </Button>,
              <Button
                key='i'
                type='button'
                size={ICON_SIZES[index]}
                intent='neutral'
                emphasis='raised'
                aria-label='Mehr'>
                <MoreHorizontalIcon />
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
          <SurfaceSample label='card' surface='card' className={cardSurface}>
            <SurfaceColumn />
          </SurfaceSample>
          <SurfaceSample label='popup' surface='popup' className={popupSurface}>
            <SurfaceColumn />
          </SurfaceSample>
        </div>
      </FoundationSection>

      <FoundationSection title='Usages' description='The pairs where they live.'>
        <div className='grid gap-group md:grid-cols-2'>
          <Preview title='Form footer' className='justify-end'>
            <Button type='button' intent='neutral' emphasis='raised'>
              Abbrechen
            </Button>
            <Button type='button'>Speichern</Button>
          </Preview>
          <Preview title='Confirmation' className='justify-end'>
            <Button type='button' intent='neutral' emphasis='raised'>
              Behalten
            </Button>
            <Button type='button' intent='destructive' emphasis='solid'>
              Endgültig löschen
            </Button>
          </Preview>
          <InsetCard>
            <InsetCardHeader
              actions={
                <Button type='button' intent='neutral' emphasis='ghost' size='icon-sm' aria-label='Bearbeiten'>
                  <PencilIcon />
                </Button>
              }>
              <InsetCardTitle>Card header action</InsetCardTitle>
            </InsetCardHeader>
            <InsetCardContent className='overflow-hidden'>
              <ItemList>
                <Item className='px-4'>
                  <ItemContent>
                    <ItemTitle>Anna Schmidt</ItemTitle>
                    <ItemDescription>Row actions: ghost</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button type='button' intent='neutral' emphasis='ghost' size='icon-sm' aria-label='Mehr'>
                      <MoreHorizontalIcon />
                    </Button>
                  </ItemActions>
                </Item>
              </ItemList>
            </InsetCardContent>
          </InsetCard>
          <Preview title='Danger zone' className='justify-between'>
            <span className='text-body text-muted-foreground'>Schule und alle Daten löschen</span>
            <Button type='button' intent='destructive' emphasis='solid' size='sm'>
              Löschen…
            </Button>
          </Preview>
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Playground: Story = {};
export const Default: Story = { render: () => <ButtonDefault /> };
export const Variants: Story = { render: () => <ButtonVariants /> };
export const Sizes: Story = { render: () => <ButtonSizes /> };
export const WithIcon: Story = {
  name: 'With icon',
  render: () => <ButtonWithIcon />,
};
export const IconOnly: Story = {
  name: 'Icon only',
  render: () => <ButtonIconOnly />,
};
export const AsLink: Story = {
  name: 'As link',
  render: () => <ButtonAsLink />,
};
export const Open: Story = { render: () => <ButtonOpen /> };
export const Pressed: Story = { render: () => <ButtonPressed /> };
export const Pending: Story = { render: () => <ButtonPending /> };
export const Disabled: Story = { render: () => <ButtonDisabled /> };
