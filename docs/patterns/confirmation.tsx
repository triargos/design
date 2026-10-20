import { ConfirmationDefault } from '../examples/patterns/confirmation/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Confirmation',
  description: 'A destructive action: subtle trigger, confirmation, toast.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='Confirmation'
      description='A destructive action outside a danger zone: destructive/subtle opens the Alert Dialog, destructive/solid confirms, a toast reports it.'>
      <ExampleSection title='Default'>
        <ConfirmationDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
