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

/** A dialog opened from a dialog stacks on it; the one below steps back. */
export function DialogNested() {
  return (
    <Dialog>
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Gruppe bearbeiten</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Gruppe bearbeiten</DialogTitle>
          <DialogDescription>Klasse 3b · 24 Mitglieder</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Dialog>
            <DialogTrigger render={<Button intent='neutral' emphasis='raised' size='sm' />}>
              Mitglieder verwalten
            </DialogTrigger>
            <DialogContent className='sm:max-w-sm'>
              <DialogHeader>
                <DialogTitle>Mitglieder</DialogTitle>
                <DialogDescription>Wer zu Klasse 3b gehört.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button />}>Fertig</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
          <Button type='button'>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
