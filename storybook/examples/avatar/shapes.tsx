import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, getInitials } from '~/components/ui/avatar';

/** Round for people, square for organizations. */
export function AvatarShapes() {
  return (
    <div className='flex flex-wrap items-center gap-4'>
      <Avatar size='2xl'>
        <AvatarFallback>{getInitials('Mia Schmidt')}</AvatarFallback>
      </Avatar>
      <Avatar size='2xl' shape='square'>
        <AvatarFallback>{getInitials('Grundschule am Park')}</AvatarFallback>
      </Avatar>
      <AvatarGroup size='xl' shape='square'>
        <Avatar>
          <AvatarFallback>{getInitials('Grundschule am Park')}</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>{getInitials('Gymnasium Nord')}</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
