import type { Meta, StoryObj } from '@storybook/react-vite';

import { DateInputCard } from '../examples/date-input/card';
import { DateInputDefault } from '../examples/date-input/default';
import { DateInputInAForm } from '../examples/date-input/in-a-form';
import { DateInputPlaceholder } from '../examples/date-input/placeholder';
import { DateInputStates } from '../examples/date-input/states';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Date Input',
  parameters: { description: 'A date, typed into segments or picked in a calendar.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Date Input'
      description='A date, typed into segments in the locale order (dd.MM.yyyy in de) at input height; the icon at the end opens the calendar. The value is an IsoDate: no time zone. A card opens the calendar.'>
      <ExampleSection title='Default'>
        <DateInputDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder' description='Empty segments, or a word for the empty value.'>
        <DateInputPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='Card'
        description={
          <>
            <Code>variant='card'</Code>: a labelled card that opens the calendar.
          </>
        }>
        <DateInputCard />
      </ExampleSection>
      <ExampleSection title='In a form' description='With a Time Input, two columns.'>
        <DateInputInAForm />
      </ExampleSection>
      <ExampleSection title='States' description='Invalid, disabled.'>
        <DateInputStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <DateInputDefault /> };
export const Placeholder: Story = { render: () => <DateInputPlaceholder /> };
export const Card: Story = { render: () => <DateInputCard /> };
export const InAForm: Story = {
  name: 'In a form',
  render: () => <DateInputInAForm />,
};
export const States: Story = { render: () => <DateInputStates /> };
