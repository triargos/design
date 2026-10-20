import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, getInitials } from '~/components/ui/avatar';

const NAMES = ['Lena Park', 'Omar Haddad', 'Sofia Rossi'] as const;
const SIZES = ['sm', 'md', 'xl', '2xl'] as const;

export function AvatarGroupSizes() {
  return (
    <div className='flex flex-col items-start gap-3'>
      {SIZES.map((size) => (
        <AvatarGroup key={size} size={size}>
          {NAMES.map((name) => (
            <Avatar key={name}>
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+4</AvatarGroupCount>
        </AvatarGroup>
      ))}
    </div>
  );
}
