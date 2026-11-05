import { Separator } from '~/components/ui/separator';

/** A hairline in `border`, as the menu and button group rules. */
export function SeparatorDefault() {
  return (
    <div className='flex w-80 flex-col gap-group'>
      <span className='text-body text-muted-foreground'>Profile</span>
      <Separator />
      <span className='text-body text-muted-foreground'>Notifications</span>
    </div>
  );
}
