import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';

/** `showCloseButton={false}`: the footer closes it. */
export function SheetWithoutCloseButton() {
  return (
    <Sheet>
      <SheetTrigger render={<Button intent='neutral' emphasis='raised' />}>Filter</SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <p className='text-body text-muted-foreground'>Klasse, Status und Zeitraum.</p>
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button />}>Anwenden</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
