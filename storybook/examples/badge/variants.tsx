import { Badge } from '~/components/ui/badge';

/** An intent at subtle (the default); solid when it needs action, outline in dense lists. */
export function BadgeVariants() {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge>Draft</Badge>
        <Badge intent='primary'>Selected</Badge>
        <Badge intent='info'>New</Badge>
        <Badge intent='success'>Done</Badge>
        <Badge intent='warning'>Blocked</Badge>
        <Badge intent='destructive'>Overdue</Badge>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge intent='warning' emphasis='solid'>
          Needs review
        </Badge>
        <Badge emphasis='outline'>Archived</Badge>
      </div>
    </div>
  );
}
