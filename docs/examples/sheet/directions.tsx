import { Button } from '~/components/ui/button';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';

/** `side='right'` (the default) or `'left'`. */
export function SheetDirections() {
  return (
    <div className='flex gap-2'>
      <Sheet>
        <SheetTrigger render={<Button />}>Left</SheetTrigger>
        <SheetContent side='left'>
          <SheetHeader>
            <SheetTitle>From the left</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className='text-body text-muted-foreground'>Navigation and folders.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={<Button />}>Right</SheetTrigger>
        <SheetContent side='right'>
          <SheetHeader>
            <SheetTitle>From the right</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className='text-body text-muted-foreground'>Details of the selected task.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
