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
        <DropdownMenuTrigger render={<Button intent='neutral' emphasis='ghost' size='icon' aria-label='Aktionen' />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <PencilIcon />
            Umbenennen…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Gruppe umbenennen</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field>
              <FieldLabel htmlFor='group-name'>Name</FieldLabel>
              <Input id='group-name' defaultValue='Klasse 3b' />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
            <Button type='button' onClick={() => setOpen(false)}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
