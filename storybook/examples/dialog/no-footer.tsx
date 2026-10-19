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
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Einladungslink</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Einladungslink</DialogTitle>
          <DialogDescription>Jeder mit diesem Link kann der Klasse beitreten.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input readOnly defaultValue='https://elternportal.de/einladung/7f3a' aria-label='Einladungslink' />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
