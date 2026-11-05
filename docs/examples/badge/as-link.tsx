import { Badge } from '~/components/ui/badge';

export function BadgeAsLink() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge intent='primary' render={<a href='#website-redesign' />}>
        Website redesign
      </Badge>
      <Badge emphasis='outline' render={<a href='#client-work' />}>
        Client work
      </Badge>
    </div>
  );
}
