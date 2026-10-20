import { CalendarDefault } from '../examples/calendar/default';
import { CalendarRange } from '../examples/calendar/range';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Calendar',
  description: 'A month to pick a day or a range in.',
  group: 'Components',
  Page: () => (
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
            <Code>mode='range'</Code>: the first click sets the start, the second the end.
          </>
        }>
        <CalendarRange />
      </ExampleSection>
    </FoundationPage>
  ),
});
