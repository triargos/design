import { Button } from '~/components/ui/button';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';

/** `size`: `default` 24rem · `lg` 28rem from `sm` up; below, three quarters of the screen. */
export function SheetSizes() {
  return (
    <div className='flex gap-2'>
      <Sheet>
        <SheetTrigger render={<Button />}>default</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Task details</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className='text-body text-muted-foreground'>Status, assignee and due date.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={<Button />}>lg</SheetTrigger>
        <SheetContent size='lg'>
          <SheetHeader>
            <SheetTitle>Keyboard shortcuts</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className='text-body text-muted-foreground'>Every shortcut, grouped by page.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
