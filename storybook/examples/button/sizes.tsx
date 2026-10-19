import { Button } from '~/components/ui/button';

export function ButtonSizes() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' size='xs'>
        Speichern
      </Button>
      <Button type='button' size='sm'>
        Speichern
      </Button>
      <Button type='button'>Speichern</Button>
      <Button type='button' size='lg'>
        Speichern
      </Button>
    </div>
  );
}
