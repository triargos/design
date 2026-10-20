import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';

/** Without a footer the body ends the dialog. */
export function DialogNoFooter() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Invite link</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite link</DialogTitle>
          <DialogDescription>Anyone with this link can join the workspace.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input readOnly defaultValue='https://acme.app/join/7f3a' aria-label='Invite link' />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
