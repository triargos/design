import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerClose,
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

/**
 * Under `DrawerProvider` the page (`DrawerIndent`) scales back over `DrawerIndentBackground`; a drawer opened from a
 * drawer stacks on it. In an app the provider wraps the whole page; here a box stands in for the viewport.
 */
export function DrawerNested() {
  return (
    <div className='relative w-full max-w-md transform-gpu overflow-hidden rounded-card shadow-border'>
      <DrawerProvider>
        <DrawerIndentBackground />
        <DrawerIndent>
          <div className='flex flex-col items-start gap-2 bg-background p-6'>
            <span className='text-heading'>Tasks</span>
            <span className='text-body text-muted-foreground'>Everything due this week, across your projects.</span>
            <Drawer>
              <DrawerTrigger render={<Button />}>Open task</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Update homepage copy</DrawerTitle>
                  <DrawerDescription>Website redesign · due today</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Drawer>
                    <DrawerTrigger render={<Button />}>Change status</DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Change status</DrawerTitle>
                        <DrawerDescription>To do, in progress or done.</DrawerDescription>
                      </DrawerHeader>
                      <DrawerFooter>
                        <DrawerClose render={<Button intent='primary' />}>Save</DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </DrawerIndent>
      </DrawerProvider>
    </div>
  );
}
