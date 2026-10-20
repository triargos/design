import { MoreHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

import { Code, FoundationPage, FoundationSection, Matrix, SpecimenList, SpecimenRow, StateCell } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const STATES = ['rest', 'hover', 'press', 'focus', 'disabled'] as const;
type State = (typeof STATES)[number];

/** One control in every state: a cell per state. */
const row = (name: string, meta: ReactNode, render: (state: State) => ReactNode) => ({
  name,
  meta,
  cells: STATES.map((state) => (
    <StateCell key={state} state={state}>
      {render(state)}
    </StateCell>
  )),
});

const off = (state: State) => state === 'disabled';

export default defineDocs({
  title: 'Interaction',
  description: 'What a control does under the pointer and the keyboard.',
  group: 'Foundations',
  Page: () => (
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
              <Button intent='primary' disabled={off(state)}>
                Save
              </Button>
            )),
            row('Raised', <Code>neutral/raised</Code>, (state) => <Button disabled={off(state)}>Edit</Button>),
            row('Ghost', <Code>neutral/ghost</Code>, (state) => (
              <Button emphasis='ghost' size='icon' aria-label='More' disabled={off(state)}>
                <MoreHorizontalIcon />
              </Button>
            )),
            row('Field', <Code>Input</Code>, (state) => (
              <Input aria-label='Name' placeholder='Name' disabled={off(state)} className='w-24' />
            )),
            row('Checkbox', <Code>Checkbox</Code>, (state) => (
              <Checkbox aria-label='Select' defaultChecked disabled={off(state)} />
            )),
            row('Switch', <Code>Switch</Code>, (state) => (
              <Switch aria-label='Active' defaultChecked disabled={off(state)} />
            )),
            row('Tab', <Code>TabsRadio</Code>, (state) => (
              // An unselected pill: the selected one only changes under the sliding indicator.
              <TabsRadioGroup value='a' onValueChange={() => undefined} aria-label='View'>
                <TabsRadio value='b' disabled={off(state)}>
                  Board
                </TabsRadio>
              </TabsRadioGroup>
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
                <Button size='icon-xs' aria-label='More'>
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
});
