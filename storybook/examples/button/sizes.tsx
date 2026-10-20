import { Button } from '~/components/ui/button';

export function ButtonSizes() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button size='xs'>Edit</Button>
      <Button size='sm'>Edit</Button>
      <Button>Edit</Button>
      <Button size='lg'>Edit</Button>
    </div>
  );
}
