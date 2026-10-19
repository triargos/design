import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChoiceCard as ChoiceCardItem, RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

import { RadioGroupChoiceCard } from '../examples/radio-group/choice-card';
import { RadioGroupDefault } from '../examples/radio-group/default';
import { RadioGroupDisabled } from '../examples/radio-group/disabled';
import { RadioGroupInvalid } from '../examples/radio-group/invalid';
import { RadioGroupWithDescription } from '../examples/radio-group/with-description';
import {
  Code,
  ExampleSection,
  FORCED_STATES,
  FoundationPage,
  FoundationSection,
  Matrix,
  StateCell,
} from '../kit/blocks';

const meta = {
  title: 'Components/Radio Group',
  component: RadioGroup,
  parameters: { description: 'One of a few options, all visible.', pseudo: FORCED_STATES },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const STATES = ['rest', 'hover', 'focus', 'invalid', 'disabled'] as const;

/** One radio in a state; each cell is its own group so `checked` holds per cell. */
const radioCell = (state: (typeof STATES)[number], checked: boolean) => (
  <StateCell key={state} state={state}>
    <RadioGroup
      aria-label='Auswahl'
      defaultValue={checked ? 'on' : undefined}
      disabled={state === 'disabled'}
      className='w-auto'>
      <RadioGroupItem value='on' aria-label='Option' aria-invalid={state === 'invalid' || undefined} />
    </RadioGroup>
  </StateCell>
);

const cardCell = (state: (typeof STATES)[number], checked: boolean) => (
  <StateCell key={state} state={state}>
    <RadioGroup
      aria-label='Grund'
      defaultValue={checked ? 'on' : undefined}
      disabled={state === 'disabled'}
      className='w-full'>
      <ChoiceCardItem value='on' aria-invalid={state === 'invalid' || undefined}>
        Arzt
      </ChoiceCardItem>
    </RadioGroup>
  </StateCell>
);

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Radio Group'
      description='One of a few options, all visible. RadioGroupItem is the flat dot next to a label; ChoiceCard is the radio as a card, for a few choices that deserve room.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>FieldSet · FieldLegend variant='label'</Code>
          </>
        }>
        <RadioGroupDefault />
      </ExampleSection>
      <ExampleSection title='With description'>
        <RadioGroupWithDescription />
      </ExampleSection>
      <ExampleSection
        title='Choice card'
        description={
          <>
            <Code>ChoiceCard</Code>: the radio as a card, for a few choices that deserve room.
          </>
        }>
        <RadioGroupChoiceCard />
      </ExampleSection>
      <ExampleSection title='Invalid' description='Not chosen yet, submitted.'>
        <RadioGroupInvalid />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <RadioGroupDisabled />
      </ExampleSection>

      <FoundationSection
        title='RadioGroupItem'
        description='Value × state, forced. The Checkbox surface as a circle, with a firmer 1px rim; the dot scales in.'>
        <Matrix
          columnWidth='5.5rem'
          columns={STATES}
          rows={[
            { name: 'unchecked', cells: STATES.map((state) => radioCell(state, false)) },
            { name: 'checked', cells: STATES.map((state) => radioCell(state, true)) },
          ]}
        />
      </FoundationSection>

      <FoundationSection
        title='ChoiceCard'
        description='Unchecked it is the quiet shell fill; checked it lifts to a card with a check in the brand hue.'>
        <Matrix
          columnWidth='7rem'
          columns={STATES}
          rows={[
            { name: 'unchecked', cells: STATES.map((state) => cardCell(state, false)) },
            { name: 'checked', cells: STATES.map((state) => cardCell(state, true)) },
          ]}
        />
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <RadioGroupDefault /> };
export const WithDescription: Story = {
  name: 'With description',
  render: () => <RadioGroupWithDescription />,
};
export const ChoiceCard: Story = {
  name: 'Choice card',
  render: () => <RadioGroupChoiceCard />,
};
export const Invalid: Story = { render: () => <RadioGroupInvalid /> };
export const Disabled: Story = { render: () => <RadioGroupDisabled /> };
