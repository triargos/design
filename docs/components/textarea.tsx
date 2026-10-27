import { TextareaDefault } from '../examples/textarea/default';
import { TextareaStates } from '../examples/textarea/states';
import { TextareaTall } from '../examples/textarea/tall';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Textarea',
  description: 'Multi-line text on the shared field surface.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Textarea'
      description='Multi-line text on the field surface. On a phone it renders 16px, where iOS does not zoom; in an Input Group, InputGroupTextarea.'>
      <ExampleSection title='Default' description='At least 60px; grows with rows.'>
        <TextareaDefault />
      </ExampleSection>
      <ExampleSection
        title='Tall'
        description={
          <>
            <Code>rows=6</Code>
          </>
        }>
        <TextareaTall />
      </ExampleSection>
      <ExampleSection title='States' description='Read-only, invalid, disabled.'>
        <TextareaStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
