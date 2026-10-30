import { LocaleDefault } from '../examples/locale/default';
import { LocaleOverride } from '../examples/locale/override';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Locale',
  description: 'The locale, time zone and control labels for every component below it.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Locale'
      description='One LocaleProvider at the app’s root. Without it: en-US, the runtime’s time zone, English labels. A component’s own prop still wins.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>locale</Code> · <Code>timeZone</Code> · <Code>labels</Code> (merged over the English defaults; a full
            pack: <Code>@pavo/locale-de</Code>)
          </>
        }>
        <LocaleDefault />
      </ExampleSection>
      <ExampleSection
        title='Override'
        description={
          <>
            <Code>label</Code>, <Code>closeLabel</Code>, <Code>locale</Code> on the component
          </>
        }>
        <LocaleOverride />
      </ExampleSection>
    </FoundationPage>
  ),
});
