import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { closeOverlays, hasSensitiveOverlay } from '~/hooks/use-overlay';

/**
 * The app calls `closeOverlays()` on every route change (here: "Go to tasks"). A `sensitive` dialog holds a draft, so it
 * stays open, and `hasSensitiveOverlay()` tells the router to ask first.
 */
export function DialogCloseOnNavigation() {
  const [route, setRoute] = useState('/projects');
  const navigate = (to: string) => {
    if (hasSensitiveOverlay() && !window.confirm('Leave this page? Your draft is lost.')) return;
    setRoute(to);
    closeOverlays();
  };
  return (
    <div className='flex flex-col items-center gap-related'>
      <div className='flex gap-related'>
        <Dialog>
          <DialogTrigger render={<Button />}>Project details</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Website redesign</DialogTitle>
              <DialogDescription>Due March 14 · 12 open tasks</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button intent='primary' onClick={() => navigate('/projects/website-redesign/tasks')}>
                Go to tasks
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog sensitive>
          <DialogTrigger render={<Button />}>New task</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field>
                <FieldLabel htmlFor='new-task-title'>Title</FieldLabel>
                <Input id='new-task-title' placeholder='Write the brief' />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button intent='primary' onClick={() => navigate('/projects/website-redesign/tasks')}>
                Go to tasks
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className='text-caption text-muted-foreground'>
        Route <span className='font-mono'>{route}</span>
      </p>
    </div>
  );
}
