import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, getInitials } from '~/components/ui/avatar';

/** Round for people, square for organizations. */
export function AvatarShapes() {
  return (
    <div className='flex flex-wrap items-center gap-4'>
      <Avatar size='2xl'>
        <AvatarFallback>{getInitials('Lena Park')}</AvatarFallback>
      </Avatar>
      <Avatar size='2xl' shape='square'>
        <AvatarFallback>{getInitials('Northwind Studio')}</AvatarFallback>
      </Avatar>
      <AvatarGroup size='xl' shape='square'>
        <Avatar>
          <AvatarFallback>{getInitials('Northwind Studio')}</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>{getInitials('Acme Labs')}</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
