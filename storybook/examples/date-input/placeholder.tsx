import type { IsoDate } from '@elternportal/domain/iso-date';

import { useState } from 'react';

import { DateInput } from '~/components/ui/date-input';

/** Empty segments, or a word for the empty value. */
export function DateInputPlaceholder() {
  const [first, setFirst] = useState<IsoDate | null>(null);
  const [second, setSecond] = useState<IsoDate | null>(null);
  return (
    <div className='flex flex-wrap gap-2'>
      <DateInput value={first} onChange={setFirst} aria-label='Datum' className='w-48' />
      <DateInput value={second} onChange={setSecond} placeholder='Unbegrenzt' aria-label='Ende' className='w-48' />
    </div>
  );
}
