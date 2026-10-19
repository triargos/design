import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarDefault } from '../examples/calendar/default';
import { CalendarDropdownNavigation } from '../examples/calendar/dropdown-navigation';
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
      description='react-day-picker in our shape: a month to pick a day or a range in. Date Input opens it; use it alone only where the calendar is the content.'>
      <ExampleSection title='Default' description='A single day.'>
        <CalendarDefault />
      </ExampleSection>
      <ExampleSection
        title='Range'
        description={
          <>
            <Code>mode='range'</Code>
          </>
        }>
        <CalendarRange />
      </ExampleSection>
      <ExampleSection
        title='Dropdown navigation'
        description={
          <>
            <Code>captionLayout='dropdown'</Code>: month and year as selects, for a date far away.
          </>
        }>
        <CalendarDropdownNavigation />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <CalendarDefault /> };
export const Range: Story = { render: () => <CalendarRange /> };
export const DropdownNavigation: Story = {
  name: 'Dropdown navigation',
  render: () => <CalendarDropdownNavigation />,
};
