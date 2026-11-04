import { IconFolderPlus } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

export function DialogWithMedia() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>New project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogMedia>
            <IconFolderPlus />
          </DialogMedia>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Start with a name. You add tasks and members next.</DialogDescription>
        </DialogHeader>
        <form className='contents' onSubmit={(event) => event.preventDefault()}>
          <DialogBody>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='project-name'>Name</FieldLabel>
                <Input id='project-name' placeholder='Website redesign' />
                <FieldDescription>Everyone in the workspace sees it.</FieldDescription>
              </Field>
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button type='submit' intent='primary'>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
