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

/** `showCloseButton={false}`: no ✕, the footer action closes it. */
export function DialogWithoutCloseButton() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Terms of service</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Updated terms of service</DialogTitle>
          <DialogDescription>Read them before you continue.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className='text-body text-muted-foreground'>
            From April 1, deleted files stay in the trash for 30 days before they are removed.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button intent='primary' />}>Got it</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
