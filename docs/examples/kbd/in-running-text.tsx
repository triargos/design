import { Kbd } from '~/components/ui/kbd';

export function KbdInRunningText() {
  return (
    <p className='text-body text-muted-foreground'>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search for a task.
    </p>
  );
}
