import { Kbd } from '~/components/ui/kbd';

export function KbdInRunningText() {
  return (
    <p className='text-body text-muted-foreground'>
      Drücke <Kbd>⌘</Kbd> <Kbd>K</Kbd>, um eine Aktion zu suchen.
    </p>
  );
}
