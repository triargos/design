import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';

/** A bottom sheet for touch, swiped down to close. */
export function DrawerDefault() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button intent='neutral' emphasis='raised' />}>Abwesenheit melden</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Abwesenheit melden</DrawerTitle>
          <DrawerDescription>Mia Schmidt · heute</DrawerDescription>
        </DrawerHeader>
        <div className='px-group text-body text-muted-foreground'>Krankheit, Arzttermin oder ein anderer Grund.</div>
        <DrawerFooter>
          <Button type='button'>Melden</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
