import { DateInputDefault } from '../examples/date-input/default';
import { DateInputInAForm } from '../examples/date-input/in-a-form';
import { DateInputLocale } from '../examples/date-input/locale';
import { DateInputPlaceholder } from '../examples/date-input/placeholder';
import { DateInputStates } from '../examples/date-input/states';
import { DateInputTime } from '../examples/date-input/time';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Date Input',
  description: 'A date or a time, typed into segments; a date can be picked in a calendar.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Date Input'
      description='A date typed into segments at input height; the icon at the end opens the calendar. The value is a YYYY-MM-DD string, no time zone. TimeInput takes a time of day as HH:mm.'>
      <ExampleSection title='Default'>
        <DateInputDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder' description='Empty segments, or a word for the empty value.'>
        <DateInputPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='Time'
        description={
          <>
            <Code>TimeInput</Code>: <Code>HH:mm</Code>, 24-hour; the segments follow the locale’s clock.
          </>
        }>
        <DateInputTime />
      </ExampleSection>
      <ExampleSection title='In a form' description='A date and a time, two columns.'>
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
      <ExampleSection title='States' description='Invalid, disabled; a date, then a time.'>
        <DateInputStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
