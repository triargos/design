import { Badge } from '~/components/ui/badge';

/** Task states: each state is one intent at the default `subtle`. */
export function BadgeStatus() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge>Draft</Badge>
      <Badge intent='info'>In review</Badge>
      <Badge intent='warning'>Blocked</Badge>
      <Badge intent='success'>Done</Badge>
      <Badge intent='destructive'>Overdue</Badge>
    </div>
  );
}
