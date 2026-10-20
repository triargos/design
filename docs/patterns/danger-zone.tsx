import { useId, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { CopyButton } from '~/components/ui/copy-button';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { DangerZoneDefault } from '../examples/patterns/danger-zone/default';
import { Code, ExampleSection, FoundationPage, FoundationSection } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const NAME = 'Website redesign';

/** Type the name to confirm; the name sits above the field with a CopyButton. */
function ConfirmDelete({ container }: { container: HTMLElement }) {
  const inputId = useId();
  const [value, setValue] = useState('');
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent container={container}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>“{NAME}” and all its tasks are deleted for good.</AlertDialogDescription>
          <Field className='mt-group'>
            <FieldLabel htmlFor={inputId}>Type the name to confirm</FieldLabel>
            <div className='flex items-center gap-related'>
              <span className='text-caption font-medium text-muted-foreground'>{NAME}</span>
              <CopyButton value={NAME} size='icon-xs' />
            </div>
            <Input id={inputId} placeholder={NAME} value={value} onChange={(event) => setValue(event.target.value)} />
          </Field>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent='destructive' disabled={value !== NAME}>
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DialogStage() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      className='relative h-[440px] transform-gpu overflow-hidden rounded-card bg-background shadow-border'>
      {container && <ConfirmDelete container={container} />}
    </div>
  );
}

export default defineDocs({
  title: 'Danger Zone',
  description: 'The last card of a settings page: actions that cost something.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='Danger Zone'
      description='The last card of a settings page. InsetCard intent="destructive" around an ItemList: each row names the action, says what it costs, and offers one button. Lifecycle actions that can be undone (withdraw, archive) are raised; a destructive row is solid and opens an AlertDialog that repeats the solid button.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>InsetCard intent="destructive"</Code> around an ItemList. Click Delete… and type the name.
          </>
        }
        bare>
        <DangerZoneDefault />
      </ExampleSection>

      <FoundationSection
        title='Confirmation, open'
        description='AlertDialog; for what cannot be undone, typing the name unlocks the solid destructive button.'>
        <div className='flex flex-col gap-related'>
          <Code>AlertDialog · CopyButton · Input</Code>
          <DialogStage />
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
});
