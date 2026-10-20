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
      <DialogTrigger render={<Button />}>Edit project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Website redesign · 8 members</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Dialog>
            <DialogTrigger render={<Button />}>Manage members</DialogTrigger>
            <DialogContent size='sm'>
              <DialogHeader>
                <DialogTitle>Members</DialogTitle>
                <DialogDescription>Who can see and edit this project.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button intent='primary' />}>Done</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button />}>Cancel</DialogClose>
          <Button type='button' intent='primary'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
