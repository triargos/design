import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from '~/components/ui/switch';

import { SwitchDefault } from '../examples/switch/default';
import { SwitchDisabled } from '../examples/switch/disabled';
import { SwitchSizes } from '../examples/switch/sizes';
import { SwitchWithDescription } from '../examples/switch/with-description';
import { SwitchWithLabel } from '../examples/switch/with-label';
import {
  Code,
  ExampleSection,
  FORCED_STATES,
  FoundationPage,
  FoundationSection,
  Matrix,
  SpecimenList,
  SpecimenRow,
  StateCell,
} from '../kit/blocks';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { 'aria-label': 'Aktiv' },
  parameters: { description: 'A setting that takes effect at once.', pseudo: FORCED_STATES },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

const STATES = ['rest', 'hover', 'press', 'focus', 'invalid', 'disabled'] as const;
const ROWS = [
  { name: 'off', props: {} },
  { name: 'on', props: { defaultChecked: true } },
  { name: 'off · sm', props: { size: 'sm' } },
  { name: 'on · sm', props: { size: 'sm', defaultChecked: true } },
] as const;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Switch'
      description='A setting that takes effect at once. Flat: a veil track and a white thumb off, the brand fill on. No edges, no shadows.'>
      <ExampleSection title='Default'>
        <SwitchDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>default 20×36 · sm 16×28</Code>
          </>
        }>
        <SwitchSizes />
      </ExampleSection>
      <ExampleSection
        title='With label'
        description={
          <>
            <Code>Field orientation='horizontal'</Code>, the switch at the end.
          </>
        }>
        <SwitchWithLabel />
      </ExampleSection>
      <ExampleSection title='With description'>
        <SwitchWithDescription />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <SwitchDisabled />
      </ExampleSection>

      <FoundationSection
        title='Value × state'
        description='Forced here. Hover strengthens the fill; a press stretches the thumb toward the other side.'>
        <Matrix
          columnWidth='5rem'
          columns={STATES}
          rows={ROWS.map((row) => ({
            name: row.name,
            cells: STATES.map((state) => (
              <StateCell key={state} state={state}>
                <Switch
                  aria-label={row.name}
                  aria-invalid={state === 'invalid' || undefined}
                  disabled={state === 'disabled'}
                  {...row.props}
                />
              </StateCell>
            )),
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Anatomy'>
        <SpecimenList>
          <SpecimenRow name='Size' meta={<Code>default 20×36 · sm 16×28</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              The thumb sits 2px in (<Code>--switch-thumb</Code>) and stretches 4px on press (
              <Code>--switch-stretch</Code>). The target reaches past the label gap (<Code>after:</Code>).
            </p>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Playground: Story = {};
export const Default: Story = { render: () => <SwitchDefault /> };
export const Sizes: Story = { render: () => <SwitchSizes /> };
export const WithLabel: Story = {
  name: 'With label',
  render: () => <SwitchWithLabel />,
};
export const WithDescription: Story = {
  name: 'With description',
  render: () => <SwitchWithDescription />,
};
export const Disabled: Story = { render: () => <SwitchDisabled /> };
