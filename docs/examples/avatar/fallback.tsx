import { IconCheck } from '@tabler/icons-react';

import { Avatar, AvatarBadge, AvatarFallback, getInitials } from '~/components/ui/avatar';

/** Initials on a quiet fill when there is no photo, or it fails to load. */
export function AvatarFallbackExample() {
  return (
    <div className='flex items-center gap-4'>
      <Avatar size='2xl'>
        <AvatarFallback>{getInitials('Mary-Kate van der Berg')}</AvatarFallback>
      </Avatar>
      <Avatar size='2xl'>
        <AvatarFallback>{getInitials('Sofia Rossi')}</AvatarFallback>
        <AvatarBadge>
          <IconCheck />
        </AvatarBadge>
      </Avatar>
    </div>
  );
}
