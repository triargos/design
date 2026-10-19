import { Kbd } from '~/components/ui/kbd';

export function KbdDefault() {
  return (
    <div className='flex items-center gap-2'>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Enter</Kbd>
    </div>
  );
}
