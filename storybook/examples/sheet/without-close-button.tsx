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

/** `showCloseButton={false}`: no ✕, the footer action closes it. */
export function SheetWithoutCloseButton() {
  return (
    <Sheet>
      <SheetTrigger render={<Button />}>Filter</SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <p className='text-body text-muted-foreground'>Project, assignee and due date.</p>
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button intent='primary' />}>Apply</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
