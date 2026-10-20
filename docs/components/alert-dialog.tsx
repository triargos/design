import { AlertDialogCloseConfirmation } from '../examples/alert-dialog/close-confirmation';
import { AlertDialogDefault } from '../examples/alert-dialog/default';
import { AlertDialogDestructive } from '../examples/alert-dialog/destructive';
import { AlertDialogSizes } from '../examples/alert-dialog/sizes';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Alert Dialog',
  description: 'Asks to confirm before an action that cannot be undone.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Alert Dialog'
      description='Asks to confirm an action before it happens. The question in the header, the actions in the footer band; no close button. AlertDialogAction is primary unless set, and does not close the dialog on its own: close it when the action is done.'>
      <ExampleSection title='Default'>
        <AlertDialogDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code> with <Code>AlertDialogMedia</Code>: centered, the two actions in equal columns.
          </>
        }>
        <AlertDialogSizes />
      </ExampleSection>
      <ExampleSection
        title='Close confirmation'
        description='Closing a dialog with changes asks first. Type a note, then press Escape.'>
        <AlertDialogCloseConfirmation />
      </ExampleSection>
      <ExampleSection
        title='Destructive'
        description={
          <>
            Opened by destructive/subtle, confirmed by <Code>intent='destructive'</Code> (solid).
          </>
        }>
        <AlertDialogDestructive />
      </ExampleSection>
    </FoundationPage>
  ),
});
