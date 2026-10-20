import { ArrowRightIcon, PlusIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

export function ButtonWithIcon() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button intent='primary'>
        <PlusIcon data-icon='inline-start' />
        New task
      </Button>
      <Button>
        Next
        <ArrowRightIcon data-icon='inline-end' />
      </Button>
    </div>
  );
}
