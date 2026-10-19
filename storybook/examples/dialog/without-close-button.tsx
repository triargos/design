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

/** `showCloseButton={false}`: the footer is the only way out. */
export function DialogWithoutCloseButton() {
  return (
    <Dialog>
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Nutzungsbedingungen</DialogTrigger>
      <DialogContent showCloseButton={false} className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Neue Nutzungsbedingungen</DialogTitle>
          <DialogDescription>Bitte lies sie, bevor du weitermachst.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className='text-body text-muted-foreground'>
            Ab dem 1. April gelten neue Regeln für die Speicherung von Fotos und Nachrichten.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button />}>Verstanden</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
