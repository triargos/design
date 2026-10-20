import { IntegerInputDefault } from '../examples/integer-input/default';
import { IntegerInputDisabled } from '../examples/integer-input/disabled';
import { IntegerInputWithMax } from '../examples/integer-input/with-max';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Integer Input',
  description: 'A whole number with steppers and a unit.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Integer Input' description='A whole number between a minus and a plus, with a unit.'>
      <ExampleSection title='Default'>
        <IntegerInputDefault />
      </ExampleSection>
      <ExampleSection
        title='With max'
        description={
          <>
            <Code>max</Code> stops the stepper and clamps typed values; the minimum is always 0.
          </>
        }>
        <IntegerInputWithMax />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <IntegerInputDisabled />
      </ExampleSection>
    </FoundationPage>
  ),
});
