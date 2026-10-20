import { IconCheck, IconClock } from '@tabler/icons-react';

import { Badge } from '~/components/ui/badge';

export function BadgeWithIcon() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge intent='success'>
        <IconCheck />
        Paid
      </Badge>
      <Badge intent='warning'>
        <IconClock />
        Due in 3 days
      </Badge>
    </div>
  );
}
