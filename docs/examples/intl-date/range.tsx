import { CalendarClockIcon } from 'lucide-react';

import { IntlDateRange } from '~/components/ui/intl-date';

/** Shared parts said once. */
export function IntlDateRangeExample() {
  return (
    <span className='flex items-center gap-2 text-body'>
      <CalendarClockIcon className='size-4 text-muted-foreground' />
      <IntlDateRange start='2025-03-10' end='2025-03-14' />
    </span>
  );
}
