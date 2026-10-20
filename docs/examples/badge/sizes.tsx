import { Badge } from '~/components/ui/badge';

/** 24px; `sm` (20px) for a count in a dense row or the sidebar. */
export function BadgeSizes() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge>Draft</Badge>
      <Badge size='sm'>Draft</Badge>
    </div>
  );
}
