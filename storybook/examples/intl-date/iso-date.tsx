import { IsoDate } from '@elternportal/domain/iso-date';

import { IsoIntlDate } from '~/components/ui/intl-date';

/** An `IsoDate`: a day, no time, no time zone. */
export function IntlDateIsoDate() {
  return (
    <span className='text-body'>
      <IsoIntlDate date={IsoDate.fromDate(new Date(2025, 2, 14))} />
    </span>
  );
}
