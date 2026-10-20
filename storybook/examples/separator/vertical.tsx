import { Separator } from '~/components/ui/separator';

export function SeparatorVertical() {
  return (
    <div className='flex h-6 items-center gap-2 text-body text-muted-foreground'>
      <span>Draft</span>
      <Separator orientation='vertical' />
      <span>Last saved 9:30 AM</span>
    </div>
  );
}
