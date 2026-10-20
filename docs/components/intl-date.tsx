import { IntlDateDay } from '../examples/intl-date/day';
import { IntlDateDefault } from '../examples/intl-date/default';
import { IntlDateLocale } from '../examples/intl-date/locale';
import { IntlDateRange } from '../examples/intl-date/range';
import { IntlDateRelative } from '../examples/intl-date/relative';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Intl Date',
  description: 'A date formatted for reading.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Intl Date'
      description='A date formatted for reading, from an ISO string. Format dates with these, never by hand.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>IntlDate</Code>: a moment in the viewer’s time zone, then two <Code>format</Code>s.
          </>
        }>
        <IntlDateDefault />
      </ExampleSection>
      <ExampleSection
        title='Day'
        description={
          <>
            A <Code>YYYY-MM-DD</Code> day has no zone: the same day for every viewer.
          </>
        }>
        <IntlDateDay />
      </ExampleSection>
      <ExampleSection
        title='Relative'
        description={
          <>
            <Code>relative</Code>: the exact moment in a tooltip.
          </>
        }>
        <IntlDateRelative />
      </ExampleSection>
      <ExampleSection
        title='Range'
        description={
          <>
            <Code>end</Code>: a range, shared parts said once.
          </>
        }>
        <IntlDateRange />
      </ExampleSection>
      <ExampleSection
        title='Locale'
        description={
          <>
            <Code>locale</Code> and <Code>timeZone</Code>; the default is en-US in the runtime’s zone.
          </>
        }>
        <IntlDateLocale />
      </ExampleSection>
    </FoundationPage>
  ),
});
