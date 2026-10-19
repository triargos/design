import { Button } from '~/components/ui/button';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';

/** `side='right'` (the default) or `'left'`. */
export function SheetDirections() {
  return (
    <div className='flex gap-2'>
      <Sheet>
        <SheetTrigger render={<Button intent='neutral' emphasis='raised' />}>Links</SheetTrigger>
        <SheetContent side='left'>
          <SheetHeader>
            <SheetTitle>Von links</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className='text-body text-muted-foreground'>Navigation und Ordner.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={<Button intent='neutral' emphasis='raised' />}>Rechts</SheetTrigger>
        <SheetContent side='right'>
          <SheetHeader>
            <SheetTitle>Von rechts</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className='text-body text-muted-foreground'>Details zum ausgewählten Eintrag.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
