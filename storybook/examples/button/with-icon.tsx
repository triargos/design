import { ArrowRightIcon, PlusIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

export function ButtonWithIcon() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button'>
        <PlusIcon data-icon='inline-start' />
        Hinzufügen
      </Button>
      <Button type='button' intent='neutral' emphasis='raised'>
        Weiter
        <ArrowRightIcon data-icon='inline-end' />
      </Button>
    </div>
  );
}
