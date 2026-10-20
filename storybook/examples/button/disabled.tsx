import { Button } from '~/components/ui/button';

export function ButtonDisabled() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button intent='primary' disabled>
        Save
      </Button>
      <Button disabled>Cancel</Button>
      <Button emphasis='ghost' disabled>
        Skip
      </Button>
    </div>
  );
}
