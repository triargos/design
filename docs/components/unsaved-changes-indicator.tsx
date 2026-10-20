import { UnsavedChangesIndicatorDefault } from '../examples/unsaved-changes-indicator/default';
import { UnsavedChangesIndicatorInACard } from '../examples/unsaved-changes-indicator/in-a-card';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Unsaved Changes Indicator',
  description: 'Says there are unsaved changes, next to the save action.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Unsaved Changes Indicator'
      description='Says there are unsaved changes, next to the save action. It slides in on its own; in a card footer, which animates its own reveal, it does not. The text defaults to “Unsaved changes”; children replace it.'>
      <ExampleSection title='Default' description='Click the button to toggle.'>
        <UnsavedChangesIndicatorDefault />
      </ExampleSection>
      <ExampleSection
        title='In a card'
        description={
          <>
            <Code>animated={'{false}'}</Code> inside InsetCardFooter.
          </>
        }
        bare>
        <UnsavedChangesIndicatorInACard />
      </ExampleSection>
    </FoundationPage>
  ),
});
