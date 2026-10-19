import type { Meta, StoryObj } from '@storybook/react-vite';
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerIndent,
  DrawerIndentBackground,
  DrawerProvider,
  DrawerTitle,
} from '~/components/ui/drawer';
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
import { DialogWithoutCloseButton } from '../examples/dialog/without-close-button';
import { Code, ExampleSection, FoundationPage, FoundationSection } from '../kit/blocks';
import { open, clickThrough } from '../kit/play';

/**
 * Every overlay, open, each on its own stage: the stage is the portal container and, through its transform, the box
 * that `fixed` positions against. Portals render light only in side-by-side mode; use single light or dark here.
 */
const meta = {
  title: 'Components/Dialog',
  parameters: {
    description: 'A modal for a task: a shell with the header and footer, the content in a card.',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

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
        <FieldLabel htmlFor='invite-email'>E-Mail</FieldLabel>
        <Input id='invite-email' type='email' placeholder='name@schule.de' />
      </Field>
      <Field>
        <FieldLabel htmlFor='invite-note'>Nachricht</FieldLabel>
        <Textarea id='invite-note' rows={3} placeholder='Optional' />
        <FieldDescription>Steht über dem Link in der Einladung.</FieldDescription>
      </Field>
    </FieldGroup>
  );
}

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Dialog'
      description='One modal shape: a shell with the header and footer on it, the content in a card. Dialog, alert dialog and side panel share it (components/ui/modal.ts); the touch drawer has its own.'>
      <ExampleSection
        title='Default'
        description='Header and footer on the shell, DialogBody is the card. A form wraps DialogBody and DialogFooter (className="contents"); submit sits in the footer.'>
        <DialogDefault />
      </ExampleSection>
      <ExampleSection title='No footer' description='Without a footer the body ends the dialog.'>
        <DialogNoFooter />
      </ExampleSection>
      <ExampleSection
        title='Without close button'
        description={
          <>
            <Code>showCloseButton={'{false}'}</Code>: the footer is the only way out.
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
                <DialogContent container={container} className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Mitglied einladen</DialogTitle>
                    <DialogDescription>Wir schicken eine E-Mail mit einem persönlichen Link.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <InviteFields />
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose render={<Button intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
                    <Button type='button'>Einladen</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </Stage>
          <Stage label='No footer'>
            {(container) => (
              <Dialog defaultOpen modal={false}>
                <DialogContent container={container} className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Einladungslink</DialogTitle>
                    <DialogDescription>Jeder mit diesem Link kann der Klasse beitreten.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <Input readOnly defaultValue='https://elternportal.de/einladung/7f3a' />
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
                    <AlertDialogTitle>Ankündigung löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Eltern sehen sie nicht mehr. Gelesen-Status und Antworten gehen verloren.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction intent='destructive' emphasis='solid'>
                      Löschen
                    </AlertDialogAction>
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
                    <AlertDialogTitle>Datei löschen?</AlertDialogTitle>
                    <AlertDialogDescription>Elternbrief_März.pdf wird endgültig entfernt.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction intent='destructive' emphasis='solid'>
                      Löschen
                    </AlertDialogAction>
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
                  <SheetTitle>Mitglied einladen</SheetTitle>
                  <SheetDescription>Wir schicken eine E-Mail mit einem persönlichen Link.</SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <InviteFields />
                </SheetBody>
                <SheetFooter>
                  <Button type='button'>Einladen</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </Stage>
      </FoundationSection>

      <FoundationSection
        title='Touch drawer'
        description='Drawer: a bottom sheet for touch menus, swiped down to close. Under DrawerProvider the page scales back; a drawer opened from a drawer stacks on it.'>
        <Stage label={<Code>Drawer</Code>}>
          {(container) => (
            <Drawer defaultOpen modal={false}>
              <DrawerContent container={container}>
                <DrawerHeader>
                  <DrawerTitle>Mitglied einladen</DrawerTitle>
                  <DrawerDescription>Wir schicken eine E-Mail mit einem persönlichen Link.</DrawerDescription>
                </DrawerHeader>
                <div className='px-group'>
                  <InviteFields />
                </div>
                <DrawerFooter>
                  <Button type='button'>Einladen</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </Stage>
        <Stage label={<Code>DrawerProvider · DrawerIndent · nested Drawer</Code>} className='h-[560px]'>
          {(container) => (
            <DrawerProvider>
              <DrawerIndentBackground />
              <DrawerIndent className='h-full'>
                <div className='flex h-full flex-col gap-related bg-background p-group'>
                  <span className='text-heading'>Abwesenheiten</span>
                  <span className='text-body text-muted-foreground'>
                    Krankmeldungen und Termine der Kinder dieser Woche.
                  </span>
                </div>
              </DrawerIndent>
              <Drawer defaultOpen modal={false}>
                <DrawerContent container={container}>
                  <DrawerHeader>
                    <DrawerTitle>Abwesenheit</DrawerTitle>
                    <DrawerDescription>Mia Schmidt · Krankheit · heute</DrawerDescription>
                  </DrawerHeader>
                  <div className='h-40' />
                  <Drawer defaultOpen modal={false}>
                    <DrawerContent container={container}>
                      <DrawerHeader>
                        <DrawerTitle>Grund ändern</DrawerTitle>
                        <DrawerDescription>Krankheit, Arzttermin oder ein anderer Grund.</DrawerDescription>
                      </DrawerHeader>
                      <DrawerFooter>
                        <Button type='button'>Speichern</Button>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </DrawerContent>
              </Drawer>
            </DrawerProvider>
          )}
        </Stage>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <DialogDefault />,
  play: open('click', 'Mitglied einladen', 'Wir schicken eine E-Mail mit einem persönlichen Link.'),
};
export const NoFooter: Story = {
  name: 'No footer',
  render: () => <DialogNoFooter />,
  play: open('click', 'Einladungslink', 'Jeder mit diesem Link kann der Klasse beitreten.'),
};
export const WithoutCloseButton: Story = {
  name: 'Without close button',
  render: () => <DialogWithoutCloseButton />,
  play: open('click', 'Nutzungsbedingungen', 'Bitte lies sie, bevor du weitermachst.'),
};
export const ScrollingBody: Story = {
  name: 'Scrolling body',
  render: () => <DialogScrollingBody />,
  play: open('click', 'Datenschutzerklärung', 'Stand: März 2025'),
};
export const Nested: Story = {
  render: () => <DialogNested />,
  play: clickThrough(
    { click: 'Gruppe bearbeiten', shows: 'Klasse 3b · 24 Mitglieder' },
    { click: 'Mitglieder verwalten', shows: 'Wer zu Klasse 3b gehört.' },
  ),
};
export const OpenedFromAMenu: Story = {
  name: 'Opened from a menu',
  render: () => <DialogOpenedFromAMenu />,
  play: clickThrough(
    { click: 'Aktionen', shows: 'Umbenennen…' },
    { click: 'Umbenennen…', role: 'menuitem', shows: 'Gruppe umbenennen' },
  ),
};
