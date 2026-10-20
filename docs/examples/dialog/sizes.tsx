import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

const SIZES = [
  { size: 'sm', title: 'Rename project', body: 'A single field.' },
  { size: 'default', title: 'Invite members', body: 'A short form.' },
  { size: 'lg', title: 'Import members', body: 'A preview table of the rows to import.' },
  { size: 'xl', title: 'Invoice INV-2041', body: 'A document preview.' },
] as const;

/** `size`: `sm` 24rem · `default` 28rem · `lg` 42rem · `xl` 56rem from `sm` up; below, the screen minus 2rem. */
export function DialogSizes() {
  return (
    <div className='flex flex-wrap gap-2'>
      {SIZES.map(({ size, title, body }) => (
        <Dialog key={size}>
          <DialogTrigger render={<Button />}>{size}</DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{body}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className='h-32 rounded-control-lg bg-muted' />
            </DialogBody>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
