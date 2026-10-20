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
        <DialogTrigger render={<Button />}>Write a note</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note for the team</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field>
              <FieldLabel htmlFor='team-note'>Note</FieldLabel>
              <Textarea id='team-note' rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button intent='primary' onClick={close}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard the note?</AlertDialogTitle>
            <AlertDialogDescription>What you wrote will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep writing</AlertDialogCancel>
            <AlertDialogAction intent='destructive' onClick={close}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
