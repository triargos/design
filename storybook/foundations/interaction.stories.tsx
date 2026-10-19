import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { TabsList, TabsTrigger } from '~/components/ui/tabs';

import { Code, FoundationPage, FoundationSection, Matrix, SpecimenList, SpecimenRow } from '../kit/blocks';

/**
 * Every state forced at once: `storybook-addon-pseudo-states` rewrites `:hover`, `:active` and `:focus-visible` rules
 * so a class on a cell (`state-hover`, …) puts everything inside it in that state.
 */
const meta = {
  title: 'Foundations/Interaction',
  parameters: {
    frame: 'page',
    pseudo: {
      hover: ['.state-hover, .state-hover *'],
      active: ['.state-press, .state-press *'],
      focusVisible: ['.state-focus, .state-focus *'],
      // Fields ring their surface on `focus-within`.
      focusWithin: ['.state-focus, .state-focus *'],
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STATES = ['rest', 'hover', 'press', 'focus', 'disabled'] as const;
type State = (typeof STATES)[number];

/** One control in every state: a cell per state, the class forces it. */
const row = (name: string, meta: ReactNode, render: (state: State) => ReactNode) => ({
  name,
  meta,
  cells: STATES.map((state) => (
    <div key={state} className={`state-${state} flex min-w-0 items-center`}>
      {render(state)}
    </div>
  )),
});

const off = (state: State) => state === 'disabled';

export const Interaction: Story = {
  render: () => (
    <FoundationPage
      title='Interaction'
      description='What a control does under the pointer and the keyboard. Every control answers the same way: hover strengthens, press shrinks, focus rings, disabled greys out.'>
      <FoundationSection
        title='States'
        description='Forced here; use the pointer and Tab to feel them. Focus shows for the keyboard only (focus-visible).'>
        <Matrix
          columnWidth='6.5rem'
          columns={STATES}
          rows={[
            row('Primary', <Code>primary/solid</Code>, (state) => (
              <Button type='button' size='sm' disabled={off(state)}>
                Speichern
              </Button>
            )),
            row('Raised', <Code>neutral/raised</Code>, (state) => (
              <Button type='button' size='sm' intent='neutral' emphasis='raised' disabled={off(state)}>
                Bearbeiten
              </Button>
            )),
            row('Ghost', <Code>neutral/ghost</Code>, (state) => (
              <Button
                type='button'
                size='icon-sm'
                intent='neutral'
                emphasis='ghost'
                aria-label='Mehr'
                disabled={off(state)}>
                <MoreHorizontalIcon />
              </Button>
            )),
            row('Field', <Code>Input</Code>, (state) => (
              <Input aria-label='Name' placeholder='Name' disabled={off(state)} className='w-24' />
            )),
            row('Checkbox', <Code>Checkbox</Code>, (state) => (
              <Checkbox aria-label='Auswahl' defaultChecked disabled={off(state)} />
            )),
            row('Switch', <Code>Switch</Code>, (state) => (
              <Switch aria-label='Aktiv' defaultChecked disabled={off(state)} />
            )),
            row('Tab', <Code>TabsTrigger</Code>, (state) => (
              // An unselected pill: the selected one only changes under the sliding indicator.
              <TabsList as='radio' value='a' onValueChange={() => undefined} aria-label='Ansicht'>
                <TabsTrigger value='b' disabled={off(state)}>
                  Karte
                </TabsTrigger>
              </TabsList>
            )),
          ]}
        />
      </FoundationSection>

      <FoundationSection title='Rules'>
        <SpecimenList>
          <SpecimenRow name='Hover' meta={<Code>duration-feedback</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              A fill one step stronger, or a stronger edge on raised controls. Only on devices that hover; touch skips
              it.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Press' meta={<Code>active:scale-[0.96]</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Buttons shrink to 96% while held. Not when they open a menu or popup (<Code>aria-haspopup</Code>).
            </p>
          </SpecimenRow>
          <SpecimenRow name='Focus' meta={<Code>ring-3 ring-ring/24</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              One soft ring in the brand hue on controls and fields alike, outside the edge. Keyboard only.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Disabled' meta={<Code>disabled · disabled-foreground</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Disabled fill and text, never <Code>opacity-50</Code> (the slider is the exception). No pointer events.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Hit area' meta={<Code>hit-area</Code>}>
            <div className='flex items-center gap-group'>
              <div className='relative flex size-11 shrink-0 items-center justify-center rounded-control-lg border border-dashed border-border-strong'>
                <Button type='button' size='icon-xs' intent='neutral' emphasis='raised' aria-label='Mehr'>
                  <MoreHorizontalIcon />
                </Button>
              </div>
              <p className='text-body text-pretty text-muted-foreground'>
                On touch, every control under 44px grows an invisible 44px target (dashed). Checkbox, radio and switch
                extend with <Code>after:</Code>.
              </p>
            </div>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};
