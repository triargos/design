import { Separator } from '~/components/ui/separator';

/** A hairline in `border-subtle`. */
export function SeparatorDefault() {
  return (
    <div className='flex w-80 flex-col gap-4'>
      <span className='text-body text-muted-foreground'>Profile</span>
      <Separator />
      <span className='text-body text-muted-foreground'>Notifications</span>
    </div>
  );
}
