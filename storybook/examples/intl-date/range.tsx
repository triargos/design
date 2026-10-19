import { CalendarClockIcon } from 'lucide-react';

import { renderDateRange } from '~/components/ui/intl-date';

export function IntlDateRange() {
  return (
    <span className='flex items-center gap-2 text-body'>
      <CalendarClockIcon className='size-4 text-muted-foreground' />
      {renderDateRange(new Date(2025, 2, 10), new Date(2025, 2, 14))}
    </span>
  );
}
