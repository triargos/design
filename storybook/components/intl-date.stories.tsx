import type { Meta, StoryObj } from '@storybook/react-vite';

import { IntlDateDefault } from '../examples/intl-date/default';
import { IntlDateIsoDate } from '../examples/intl-date/iso-date';
import { IntlDateRange } from '../examples/intl-date/range';
import { IntlDateRelative } from '../examples/intl-date/relative';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Intl Date',
  parameters: { description: 'A date formatted for reading, in the user’s locale.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Intl Date'
      description='A date formatted for reading, in the user’s locale. Format with intl-date, never by hand.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>IntlDate</Code>: default, then two <Code>format</Code>s.
          </>
        }>
        <IntlDateDefault />
      </ExampleSection>
      <ExampleSection
        title='ISO date'
        description={
          <>
            <Code>IsoIntlDate</Code>: an IsoDate, a day with no time.
          </>
        }>
        <IntlDateIsoDate />
      </ExampleSection>
      <ExampleSection
        title='Relative'
        description={
          <>
            <Code>RelativeIntlDate</Code>: the exact time in a tooltip.
          </>
        }>
        <IntlDateRelative />
      </ExampleSection>
      <ExampleSection
        title='Range'
        description={
          <>
            <Code>renderDateRange(start, end)</Code>
          </>
        }>
        <IntlDateRange />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <IntlDateDefault /> };
export const ISODate: Story = {
  name: 'ISO date',
  render: () => <IntlDateIsoDate />,
};
export const Relative: Story = { render: () => <IntlDateRelative /> };
export const Range: Story = { render: () => <IntlDateRange /> };
