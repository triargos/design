import { Badge } from '~/components/ui/badge';

/** Corners follow the height, as on a button; pill for counts and chips. */
export function BadgeShapes() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge intent='info'>Neu</Badge>
      <Badge intent='info' shape='pill'>
        Neu
      </Badge>
    </div>
  );
}
