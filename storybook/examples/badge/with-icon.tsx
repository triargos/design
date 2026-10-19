import { CheckIcon, ClockIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';

export function BadgeWithIcon() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge intent='success'>
        <CheckIcon />
        Genehmigt
      </Badge>
      <Badge intent='warning'>
        <ClockIcon />
        Ausstehend
      </Badge>
    </div>
  );
}
