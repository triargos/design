import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

const SECTIONS = Array.from({ length: 12 }, (_, index) => ({
  title: `Section ${index + 1}`,
  body: 'We process workspace data only to run the service and never share it with third parties.',
}));

/** A long body scrolls; header and footer stay. */
export function DialogScrollingBody() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Privacy policy</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privacy policy</DialogTitle>
          <DialogDescription>Last updated March 2025</DialogDescription>
        </DialogHeader>
        <DialogBody className='max-h-80 overflow-y-auto'>
          <div className='flex flex-col gap-4'>
            {SECTIONS.map((section) => (
              <section key={section.title} className='flex flex-col gap-1'>
                <h3 className='text-body font-medium'>{section.title}</h3>
                <p className='text-body text-muted-foreground'>{section.body}</p>
              </section>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button intent='primary' />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
