import { KbdCombinations } from '../examples/kbd/combinations';
import { KbdDefault } from '../examples/kbd/default';
import { KbdInRunningText } from '../examples/kbd/in-running-text';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Kbd',
  description: 'A key on the keyboard.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Kbd'
      description='A key on the keyboard, in caption on the quiet fill. In a tooltip, it names a control’s shortcut (Shortcut Tooltip).'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>20px · rounded-control-xs</Code>
          </>
        }>
        <KbdDefault />
      </ExampleSection>
      <ExampleSection
        title='Combinations'
        description={
          <>
            <Code>KbdGroup</Code>
          </>
        }>
        <KbdCombinations />
      </ExampleSection>
      <ExampleSection title='In running text'>
        <KbdInRunningText />
      </ExampleSection>
    </FoundationPage>
  ),
});
