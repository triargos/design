import { Badge } from '~/components/ui/badge';

export function BadgeWithCount() {
  return (
    <div className='flex items-center gap-2 text-body'>
      Nachrichten
      <Badge intent='primary' emphasis='solid' shape='pill' size='sm'>
        3
      </Badge>
    </div>
  );
}
