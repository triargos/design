import type { Meta, StoryObj } from '@storybook/react-vite';

import { DateInputDefault } from '../examples/date-input/default';
import { DateInputInAForm } from '../examples/date-input/in-a-form';
import { DateInputLocale } from '../examples/date-input/locale';
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
      description='A date typed into segments at input height; the icon at the end opens the calendar. The value is a YYYY-MM-DD string, no time zone.'>
      <ExampleSection title='Default'>
        <DateInputDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder' description='Empty segments, or a word for the empty value.'>
        <DateInputPlaceholder />
      </ExampleSection>
      <ExampleSection title='In a form' description='With a Time Input, two columns.'>
        <DateInputInAForm />
      </ExampleSection>
      <ExampleSection
        title='Locale'
        description={
          <>
            <Code>locale</Code> sets the segment order and the calendar; the default is en-US.
          </>
        }>
        <DateInputLocale />
      </ExampleSection>
      <ExampleSection title='States' description='Invalid, disabled.'>
        <DateInputStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <DateInputDefault /> };
export const Placeholder: Story = { render: () => <DateInputPlaceholder /> };
export const InAForm: Story = {
  name: 'In a form',
  render: () => <DateInputInAForm />,
};
export const Locale: Story = { render: () => <DateInputLocale /> };
export const States: Story = { render: () => <DateInputStates /> };
