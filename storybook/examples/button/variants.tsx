import { Button } from '~/components/ui/button';

/** The five pairs: main action, every other action, quiet action, irreversible, opens a confirmation. */
export function ButtonVariants() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button intent='primary'>Create project</Button>
      <Button>Cancel</Button>
      <Button emphasis='ghost'>Skip</Button>
      <Button intent='destructive'>Delete forever</Button>
      <Button intent='destructive' emphasis='subtle'>
        Delete…
      </Button>
    </div>
  );
}
