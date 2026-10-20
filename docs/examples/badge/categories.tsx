import { Badge } from '~/components/ui/badge';

/** Project types without a chosen color: each takes the next category in order, so neighbours differ. */
const PROJECT_TYPES = ['Client work', 'Internal', 'Research', 'Hiring', 'Events', 'Support', 'Finance', 'Training'];

export function BadgeCategories() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {PROJECT_TYPES.map((type, index) => (
        <Badge key={type} color={`var(--category-${(index % 8) + 1})`}>
          {type}
        </Badge>
      ))}
    </div>
  );
}
