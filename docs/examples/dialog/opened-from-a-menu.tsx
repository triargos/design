import { MoreHorizontalIcon, PencilIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

/** The menu item sets the dialog’s `open`; the dialog lives outside the menu, so closing the menu keeps it. */
export function DialogOpenedFromAMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button emphasis='ghost' size='icon' aria-label='Actions' />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <PencilIcon />
            Rename…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field>
              <FieldLabel htmlFor='project-name'>Name</FieldLabel>
              <Input id='project-name' defaultValue='Website redesign' />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button type='button' intent='primary' onClick={() => setOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
