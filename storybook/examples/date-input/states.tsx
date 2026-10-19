import { IsoDate } from '@elternportal/domain/iso-date';

import { DateInput } from '~/components/ui/date-input';

const MARCH_14 = IsoDate.fromDate(new Date(2025, 2, 14));

export function DateInputStates() {
  return (
    <div className='flex flex-wrap gap-2'>
      <DateInput value={MARCH_14} onChange={() => undefined} aria-invalid aria-label='Ungültig' className='w-48' />
      <DateInput value={MARCH_14} onChange={() => undefined} disabled aria-label='Deaktiviert' className='w-48' />
    </div>
  );
}
