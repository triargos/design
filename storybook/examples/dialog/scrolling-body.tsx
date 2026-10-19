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
  title: `§ ${index + 1}`,
  body: 'Die Schule verarbeitet die Angaben nur für die Organisation des Schulalltags und gibt sie nicht an Dritte weiter.',
}));

/** A long body scrolls; header and footer stay. */
export function DialogScrollingBody() {
  return (
    <Dialog>
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Datenschutzerklärung</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Datenschutzerklärung</DialogTitle>
          <DialogDescription>Stand: März 2025</DialogDescription>
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
          <DialogClose render={<Button />}>Schließen</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
