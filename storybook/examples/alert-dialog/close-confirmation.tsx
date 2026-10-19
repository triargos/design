import { useState } from 'react';

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
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Field, FieldLabel } from '~/components/ui/field';
import { Textarea } from '~/components/ui/textarea';

/** Closing a dialog with changes asks first. */
export function AlertDialogCloseConfirmation() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState('');
  const close = () => {
    setConfirming(false);
    setOpen(false);
    setNote('');
  };
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true);
          else if (note === '') close();
          else setConfirming(true);
        }}>
        <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Notiz schreiben</DialogTrigger>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Notiz für die Klassenleitung</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field>
              <FieldLabel htmlFor='class-note'>Notiz</FieldLabel>
              <Textarea id='class-note' rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
            <Button type='button' onClick={close}>
              Senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notiz verwerfen?</AlertDialogTitle>
            <AlertDialogDescription>Was du geschrieben hast, geht verloren.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Weiter schreiben</AlertDialogCancel>
            <AlertDialogAction intent='destructive' emphasis='solid' onClick={close}>
              Verwerfen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
