import { StepperDefault } from '../examples/stepper/default';
import { StepperDone } from '../examples/stepper/done';
import { StepperLoading } from '../examples/stepper/loading';
import { StepperVertical } from '../examples/stepper/vertical';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Stepper',
  description: 'A fixed sequence and where someone is in it.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Stepper' description='A fixed sequence and where someone is in it.'>
      <ExampleSection
        title='Default'
        description={
          <>
            Horizontal, <Code>value={'{2}'}</Code>: done, active, todo.
          </>
        }>
        <StepperDefault />
      </ExampleSection>
      <ExampleSection
        title='Vertical'
        description={
          <>
            <Code>orientation='vertical'</Code>, with a <Code>StepperDescription</Code> under each title.
          </>
        }>
        <StepperVertical />
      </ExampleSection>
      <ExampleSection
        title='Loading'
        description={
          <>
            <Code>loading</Code>: the active step's indicator spins.
          </>
        }>
        <StepperLoading />
      </ExampleSection>
      <ExampleSection
        title='Done'
        description={
          <>
            <Code>value</Code> past the last step.
          </>
        }>
        <StepperDone />
      </ExampleSection>
    </FoundationPage>
  ),
});
