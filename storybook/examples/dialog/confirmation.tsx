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
  DialogTrigger,
} from '~/components/ui/dialog';

/** A dialog with nothing but a header puts the header in the body and reads like an AlertDialog. */
export function DialogConfirmation() {
  return (
    <Dialog>
      <DialogTrigger render={<Button intent='destructive' emphasis='subtle' />}>Mitglied entfernen…</DialogTrigger>
      <DialogContent>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>Mitglied entfernen?</DialogTitle>
            <DialogDescription>Erika Mustermann verliert den Zugang zu dieser Schule.</DialogDescription>
          </DialogHeader>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
          <DialogClose render={<Button intent='destructive' emphasis='solid' />}>Entfernen</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
