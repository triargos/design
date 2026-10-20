import { IconArrowRight, IconPlus } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';

export function ButtonWithIcon() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button intent='primary'>
        <IconPlus data-icon='inline-start' />
        New task
      </Button>
      <Button>
        Next
        <IconArrowRight data-icon='inline-end' />
      </Button>
    </div>
  );
}
