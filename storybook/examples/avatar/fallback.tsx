import { CheckIcon } from 'lucide-react';

import { Avatar, AvatarBadge, AvatarFallback, getInitials } from '~/components/ui/avatar';

/** Initials on a quiet fill when there is no photo, or it fails to load. */
export function AvatarFallbackExample() {
  return (
    <div className='flex items-center gap-4'>
      <Avatar size='2xl'>
        <AvatarFallback>{getInitials('Anna-Lena von Müller')}</AvatarFallback>
      </Avatar>
      <Avatar size='2xl'>
        <AvatarFallback>{getInitials('Emma Fischer')}</AvatarFallback>
        <AvatarBadge>
          <CheckIcon />
        </AvatarBadge>
      </Avatar>
    </div>
  );
}
