import { useState } from 'react';

import { CopyButton } from '~/components/ui/copy-button';
import { DateInput } from '~/components/ui/date-input';
import { IntegerInput } from '~/components/ui/integer-input';
import { IntlDate } from '~/components/ui/intl-date';
import { LocaleProvider } from '~/components/ui/locale';
import { de } from '~/lib/locales/de';

/** One provider sets the locale, the time zone and the labels of every control below it; `de` is the `locale-de` pack. */
export function LocaleDefault() {
  const [date, setDate] = useState('2025-03-14');
  const [seats, setSeats] = useState(4);
  return (
    <LocaleProvider locale='de-DE' timeZone='Europe/Berlin' labels={de}>
      <div className='flex flex-col gap-group'>
        <DateInput aria-label='Fällig am' value={date} onValueChange={setDate} />
        <IntegerInput aria-label='Plätze' value={seats} onValueChange={setSeats} />
        <div className='flex items-center gap-related text-body'>
          <IntlDate date='2025-03-14T09:30:00Z' />
          <CopyButton value='INV-2025-0042' />
        </div>
      </div>
    </LocaleProvider>
  );
}
