import { ButtonGroupDefault } from '../examples/button-group/default';
import { ButtonGroupVertical } from '../examples/button-group/vertical';
import { ButtonGroupWithSeparator } from '../examples/button-group/with-separator';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Button Group',
  description: 'Buttons that act on one thing, joined.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Button Group'
      description='Buttons that act on one thing, joined: inner corners go square, the outer ends keep the buttons’ radius. A field with its own action is an Input Group, not a button group.'>
      <ExampleSection title='Default'>
        <ButtonGroupDefault />
      </ExampleSection>
      <ExampleSection
        title='With separator'
        description={
          <>
            A split button: solid buttons need <Code>ButtonGroupSeparator</Code> to read as two.
          </>
        }>
        <ButtonGroupWithSeparator />
      </ExampleSection>
      <ExampleSection
        title='Vertical'
        description={
          <>
            <Code>orientation='vertical'</Code>
          </>
        }>
        <ButtonGroupVertical />
      </ExampleSection>
    </FoundationPage>
  ),
});
