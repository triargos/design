import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerIndent,
  DrawerIndentBackground,
  DrawerProvider,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';

/** Under `DrawerProvider` the page (`DrawerIndent`) scales back; a drawer opened from a drawer stacks on it. */
export function DrawerNested() {
  return (
    <DrawerProvider>
      <DrawerIndentBackground />
      <DrawerIndent>
        <div className='flex flex-col items-start gap-2 bg-background p-6'>
          <span className='text-heading'>Abwesenheiten</span>
          <span className='text-body text-muted-foreground'>Krankmeldungen und Termine der Kinder dieser Woche.</span>
          <Drawer>
            <DrawerTrigger render={<Button intent='neutral' emphasis='raised' />}>Abwesenheit öffnen</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Abwesenheit</DrawerTitle>
                <DrawerDescription>Mia Schmidt · Krankheit · heute</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Drawer>
                  <DrawerTrigger render={<Button intent='neutral' emphasis='raised' />}>Grund ändern</DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Grund ändern</DrawerTitle>
                      <DrawerDescription>Krankheit, Arzttermin oder ein anderer Grund.</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button type='button'>Speichern</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </DrawerIndent>
    </DrawerProvider>
  );
}
