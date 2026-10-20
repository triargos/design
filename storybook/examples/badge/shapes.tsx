import { Badge } from '~/components/ui/badge';

/** Rounded for a state; pill for a count or a filter chip. */
export function BadgeShapes() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge intent='info'>New</Badge>
      <Badge intent='info' shape='pill'>
        New
      </Badge>
    </div>
  );
}
