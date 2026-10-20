import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

/** Not a group: a field and a button, one related gap apart. */
export function InputGroupSideBySide() {
  return (
    <div className='flex w-96 items-center gap-2'>
      <Input placeholder='name@example.com' aria-label='Email' className='flex-1' />
      <Button type='button'>Invite</Button>
    </div>
  );
}
