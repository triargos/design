import { Trash2Icon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { Textarea } from '~/components/ui/textarea';

import { cn } from '~/lib/utils';

import { DialogDefault } from '../examples/dialog/default';
import { DialogNested } from '../examples/dialog/nested';
import { DialogNoFooter } from '../examples/dialog/no-footer';
import { DialogOpenedFromAMenu } from '../examples/dialog/opened-from-a-menu';
import { DialogScrollingBody } from '../examples/dialog/scrolling-body';
import { DialogSizes } from '../examples/dialog/sizes';
import { DialogWithoutCloseButton } from '../examples/dialog/without-close-button';
import { Code, ExampleSection, FoundationPage, FoundationSection } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

/** A page-sized box on the page surface that hosts one open overlay. */
function Stage({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div className='flex flex-col gap-related'>
      <div className='text-caption text-muted-foreground'>{label}</div>
      <div
        ref={setContainer}
        className={cn(
          'relative h-[460px] transform-gpu overflow-hidden rounded-card bg-background shadow-border',
          className,
        )}>
        {container && children(container)}
      </div>
    </div>
  );
}

function InviteFields() {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='invite-email'>Email</FieldLabel>
        <Input id='invite-email' type='email' placeholder='name@company.com' />
      </Field>
      <Field>
        <FieldLabel htmlFor='invite-note'>Message</FieldLabel>
        <Textarea id='invite-note' rows={3} placeholder='Optional' />
        <FieldDescription>Shown above the link in the invitation.</FieldDescription>
      </Field>
    </FieldGroup>
  );
}

export default defineDocs({
  title: 'Dialog',
  description: 'A modal for a task: a shell with the header and footer, the content in a card.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Dialog'
      description='One modal shape: a shell with the header and footer on it, the content in a card. Dialog, alert dialog and side panel share it.'>
      <ExampleSection
        title='Default'
        description='Header and footer on the shell, DialogBody is the card. A form wraps DialogBody and DialogFooter (className="contents"); submit sits in the footer.'>
        <DialogDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size</Code>: <Code>sm</Code> 24rem · <Code>default</Code> 28rem · <Code>lg</Code> 42rem ·{' '}
            <Code>xl</Code> 56rem from <Code>sm</Code> up.
          </>
        }>
        <DialogSizes />
      </ExampleSection>
      <ExampleSection title='No footer' description='Without a footer the body ends the dialog.'>
        <DialogNoFooter />
      </ExampleSection>
      <ExampleSection
        title='Without close button'
        description={
          <>
            <Code>showCloseButton={'{false}'}</Code>: no ✕, the footer action closes it.
          </>
        }>
        <DialogWithoutCloseButton />
      </ExampleSection>
      <ExampleSection title='Scrolling body' description='A long body scrolls; header and footer stay.'>
        <DialogScrollingBody />
      </ExampleSection>
      <ExampleSection title='Nested' description='A dialog opened from a dialog stacks on it.'>
        <DialogNested />
      </ExampleSection>
      <ExampleSection
        title='Opened from a menu'
        description='The menu item sets the dialog’s open; the dialog lives outside the menu.'>
        <DialogOpenedFromAMenu />
      </ExampleSection>

      <FoundationSection
        title='Dialog'
        description='DialogHeader and DialogFooter sit on the shell, DialogBody is the card. Without a footer the body ends the dialog.'>
        <div className='flex flex-col gap-group'>
          <Stage label={<Code>DialogHeader · DialogBody · DialogFooter</Code>}>
            {(container) => (
              <Dialog defaultOpen modal={false}>
                <DialogContent container={container}>
                  <DialogHeader>
                    <DialogTitle>Invite member</DialogTitle>
                    <DialogDescription>We’ll email them a link to join the workspace.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <InviteFields />
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose render={<Button />}>Cancel</DialogClose>
                    <Button intent='primary'>Send invite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </Stage>
          <Stage label='No footer'>
            {(container) => (
              <Dialog defaultOpen modal={false}>
                <DialogContent container={container}>
                  <DialogHeader>
                    <DialogTitle>Invite link</DialogTitle>
                    <DialogDescription>Anyone with this link can join the workspace.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <Input readOnly defaultValue='https://acme.app/join/7f3a' aria-label='Invite link' />
                  </DialogBody>
                </DialogContent>
              </Dialog>
            )}
          </Stage>
        </div>
      </FoundationSection>

      <FoundationSection
        title='Confirmation'
        description='Every confirmation is an AlertDialog (Components/Alert Dialog): the header is the card, the actions sit on the shell; no close button.'>
        <div className='flex flex-col gap-group'>
          <Stage label={<Code>AlertDialog</Code>} className='h-[280px]'>
            {(container) => (
              <AlertDialog defaultOpen>
                <AlertDialogContent container={container}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete the project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Its tasks, documents and comments are deleted for everyone. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction intent='destructive'>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </Stage>
          <Stage label={<Code>size='sm' · AlertDialogMedia</Code>} className='h-[280px]'>
            {(container) => (
              <AlertDialog defaultOpen>
                <AlertDialogContent container={container} size='sm'>
                  <AlertDialogHeader>
                    <AlertDialogMedia>
                      <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete file?</AlertDialogTitle>
                    <AlertDialogDescription>Q1-report.pdf will be deleted permanently.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction intent='destructive'>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </Stage>
        </div>
      </FoundationSection>

      <FoundationSection
        title='Side panel'
        description='Sheet: the same shell, full height. SheetBody scrolls; from sm the panel floats 8px in.'>
        <Stage label={<Code>SheetHeader · SheetBody · SheetFooter</Code>} className='h-[560px]'>
          {(container) => (
            <Sheet defaultOpen modal={false}>
              <SheetContent container={container}>
                <SheetHeader>
                  <SheetTitle>Invite member</SheetTitle>
                  <SheetDescription>We’ll email them a link to join the workspace.</SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <InviteFields />
                </SheetBody>
                <SheetFooter>
                  <Button intent='primary'>Send invite</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </Stage>
      </FoundationSection>
    </FoundationPage>
  ),
});
