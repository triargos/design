import { Avatar, AvatarFallback, type AvatarSize } from '~/components/ui/avatar';

const SIZES: ReadonlyArray<AvatarSize> = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

/** 12 to 80px. */
export function AvatarSizes() {
  return (
    <div className='flex flex-wrap items-end gap-3'>
      {SIZES.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>LP</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
