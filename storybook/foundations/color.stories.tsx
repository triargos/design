import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '~/components/ui/badge';
import { type Intent, INTENTS } from '~/components/ui/intent-variants';

import {
  Code,
  FoundationPage,
  FoundationSection,
  Matrix,
  SpecimenList,
  SpecimenRow,
  SwatchGrid,
  type SwatchToken,
} from '../kit/blocks';

const meta = {
  title: 'Foundations/Color',
  parameters: { frame: 'page' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** Literal class names per intent, so Tailwind generates them. */
const INTENT_CLASSES: Record<
  Intent,
  { hue: string; solid: string; subtle: string; border: string; use: string; branded: boolean }
> = {
  neutral: {
    hue: 'text-neutral',
    solid: 'bg-neutral-solid text-neutral-solid-foreground',
    subtle: 'bg-neutral-subtle text-neutral-subtle-foreground',
    border: 'inset-ring inset-ring-neutral-border text-neutral-subtle-foreground',
    use: 'Default; no meaning',
    branded: false,
  },
  primary: {
    hue: 'text-primary',
    solid: 'bg-primary-solid text-primary-solid-foreground',
    subtle: 'bg-primary-subtle text-primary-subtle-foreground',
    border: 'inset-ring inset-ring-primary-border text-primary-subtle-foreground',
    use: 'The brand: main action, selection',
    branded: true,
  },
  info: {
    hue: 'text-info',
    solid: 'bg-info-solid text-info-solid-foreground',
    subtle: 'bg-info-subtle text-info-subtle-foreground',
    border: 'inset-ring inset-ring-info-border text-info-subtle-foreground',
    use: 'News, new',
    branded: false,
  },
  success: {
    hue: 'text-success',
    solid: 'bg-success-solid text-success-solid-foreground',
    subtle: 'bg-success-subtle text-success-subtle-foreground',
    border: 'inset-ring inset-ring-success-border text-success-subtle-foreground',
    use: 'Done, approved',
    branded: false,
  },
  warning: {
    hue: 'text-warning',
    solid: 'bg-warning-solid text-warning-solid-foreground',
    subtle: 'bg-warning-subtle text-warning-subtle-foreground',
    border: 'inset-ring inset-ring-warning-border text-warning-subtle-foreground',
    use: 'Needs attention, pending',
    branded: false,
  },
  destructive: {
    hue: 'text-destructive',
    solid: 'bg-destructive-solid text-destructive-solid-foreground',
    subtle: 'bg-destructive-subtle text-destructive-subtle-foreground',
    border: 'inset-ring inset-ring-destructive-border text-destructive-subtle-foreground',
    use: 'Failed, rejected, irreversible',
    branded: true,
  },
};

function Chip({ className, children }: { className: string; children: string }) {
  return <span className={`inline-flex h-7 items-center rounded-md px-2.5 text-control ${className}`}>{children}</span>;
}

const text: ReadonlyArray<SwatchToken> = [
  { token: 'foreground', role: 'Titles, body text', kind: 'text' },
  { token: 'muted-foreground', role: 'Descriptions, secondary text', kind: 'text' },
  { token: 'faint-foreground', role: 'Placeholders, shortcuts, tertiary meta', kind: 'text' },
  { token: 'disabled-foreground', role: 'Disabled labels and values', kind: 'text' },
];

const surfaces: ReadonlyArray<SwatchToken> = [
  { token: 'sidebar', role: 'App frame behind the page panel', on: 'var(--sidebar-foreground)' },
  { token: 'background', role: 'Page panel, the main reading surface', on: 'var(--foreground)' },
  { token: 'shell', role: 'InsetCard shell; one step from its surface', on: 'var(--foreground)' },
  { token: 'card', role: 'Card body: InsetCardContent, DialogBody', on: 'var(--card-foreground)' },
  { token: 'popover', role: 'Menus, popovers, default dialogs', on: 'var(--popover-foreground)' },
  { token: 'surface', role: 'Field surface (inputSurfaceVariants)', on: 'var(--foreground)' },
];

const fills: ReadonlyArray<SwatchToken> = [
  { token: 'muted', role: 'Quiet fill, selected row; surface-relative', on: 'var(--foreground)' },
  {
    token: 'row-hover',
    role: 'Row under the pointer: lists, tables, accordions; half a muted step',
    on: 'var(--foreground)',
  },
  { token: 'field', role: 'File rows, inset boxes; surface-relative', on: 'var(--foreground)' },
  { token: 'disabled', role: 'Disabled controls and fields', on: 'var(--disabled-foreground)' },
];

const lines: ReadonlyArray<SwatchToken> = [
  { token: 'border-subtle', role: 'Row separators: lists, tables, accordions', kind: 'line' },
  { token: 'border', role: 'Hairlines, separators', kind: 'line' },
  { token: 'border-strong', role: 'Edges that must read: checkboxes, dividers in dense UI', kind: 'line' },
  { token: 'field-border', role: 'Field edge; pure black/white', kind: 'line' },
  { token: 'ring', role: 'Focus ring', kind: 'line' },
];

const charts: ReadonlyArray<SwatchToken> = [1, 2, 3, 4, 5].map((step) => ({
  token: `chart-${step}`,
  role: `Series ${step}; static, not branded`,
}));

/** Old names that still render, and the token each reads. */
const ALIASES: ReadonlyArray<[string, string]> = [
  ['bg-primary', 'primary-solid (the brand fill)'],
  ['bg-destructive-strong', 'destructive-solid'],
  ['bg-{intent}-tint', '{intent}-subtle'],
  ['text-{intent}-text', '{intent}-subtle-foreground'],
  ['bg-{status}/10', '{intent}-subtle'],
  ['bg-secondary · bg-accent', 'neutral-subtle, or a raised button'],
  ['disabled:opacity-50', 'disabled · disabled-foreground'],
];

export const Color: Story = {
  render: () => (
    <FoundationPage
      title='Color'
      description='Every value is generated from the organization’s three brand names. Components pick an intent (what it means) and an emphasis (how loud); text picks a level. Switch the brand, mode and surface in the toolbar.'>
      <FoundationSection
        title='Intents'
        description='One set per intent. The bare name is the hue for text and icons, never a fill; solid and subtle are fills with their own text; border is the edge. Primary and destructive follow the brand.'>
        <Matrix
          columns={['{i}', '{i}-solid', '{i}-subtle', '{i}-border']}
          columnWidth='6.5rem'
          rows={INTENTS.map((intent) => {
            const classes = INTENT_CLASSES[intent];
            return {
              name: intent,
              meta: classes.branded ? `${classes.use} · branded` : classes.use,
              cells: [
                <span key='hue' className={`text-control font-medium ${classes.hue}`}>
                  Text
                </span>,
                <Chip key='solid' className={classes.solid}>
                  Solid
                </Chip>,
                <Chip key='subtle' className={classes.subtle}>
                  Subtle
                </Chip>,
                <Chip key='border' className={classes.border}>
                  Outline
                </Chip>,
              ],
            };
          })}
        />
      </FoundationSection>

      <FoundationSection
        title='One status pattern per intent'
        description='A state is a subtle Badge. A dot or a hue only next to a label that names it; a Callout for a notice.'>
        <SpecimenList>
          <SpecimenRow name='Badge' meta={<Code>intent · emphasis='subtle'</Code>}>
            <div className='flex flex-wrap gap-related'>
              <Badge intent='success'>Genehmigt</Badge>
              <Badge intent='warning'>Ausstehend</Badge>
              <Badge intent='info'>Neu</Badge>
              <Badge intent='destructive'>Abgelehnt</Badge>
              <Badge intent='neutral'>Entwurf</Badge>
            </div>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>

      <FoundationSection title='Text' description='Four levels, from titles to disabled.'>
        <SwatchGrid tokens={text} />
      </FoundationSection>

      <FoundationSection title='Surfaces' description='From back to front.'>
        <SwatchGrid tokens={surfaces} />
      </FoundationSection>

      <FoundationSection title='Fills' description='Quiet fills read one step from the surface they sit on.'>
        <SwatchGrid tokens={fills} />
      </FoundationSection>

      <FoundationSection title='Lines' description='Three border levels; the focus ring is not decorative.'>
        <SwatchGrid tokens={lines} />
      </FoundationSection>

      <FoundationSection title='Charts'>
        <SwatchGrid tokens={charts} />
      </FoundationSection>

      <FoundationSection
        title='Aliases'
        description='Old names keep rendering until the app migrates. Write the new name in new code.'>
        <SpecimenList>
          {ALIASES.map(([old, next]) => (
            <SpecimenRow key={old} name={old}>
              <Code>{next}</Code>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};
