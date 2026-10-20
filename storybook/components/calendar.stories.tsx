import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarDefault } from '../examples/calendar/default';
import { CalendarRange } from '../examples/calendar/range';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Calendar',
  parameters: { description: 'A month to pick a day or a range in.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Calendar'
      description='A month to pick a day or a range in. Date Input opens it; use it alone where the calendar is the content.'>
      <ExampleSection
        title='Default'
        description={
          <>
            A day as <Code>YYYY-MM-DD</Code>.
          </>
        }>
        <CalendarDefault />
      </ExampleSection>
      <ExampleSection
        title='Range'
        description={
          <>
            <Code>RangeCalendar</Code>: the first click sets the start, the second the end.
          </>
        }>
        <CalendarRange />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <CalendarDefault /> };
export const Range: Story = { render: () => <CalendarRange /> };
