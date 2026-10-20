import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';

/** A bottom sheet for touch, swiped down to close. `DrawerClose` closes it from a button. */
export function DrawerDefault() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Move task</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move task</DrawerTitle>
          <DrawerDescription>Update homepage copy · Website redesign</DrawerDescription>
        </DrawerHeader>
        <div className='px-group text-body text-muted-foreground'>Pick the project and the status it moves to.</div>
        <DrawerFooter>
          <DrawerClose render={<Button intent='primary' />}>Move</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
