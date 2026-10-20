import { TimeInputDefault } from '../examples/time-input/default';
import { TimeInputStates } from '../examples/time-input/states';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Time Input',
  description: 'A time of day, typed into segments.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Time Input'
      description='A time of day typed into segments at input height. The value is a 24-hour HH:mm string, empty is the empty string; the segments follow the locale’s clock.'>
      <ExampleSection title='Default'>
        <TimeInputDefault />
      </ExampleSection>
      <ExampleSection title='States' description='Empty, invalid, disabled.'>
        <TimeInputStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
