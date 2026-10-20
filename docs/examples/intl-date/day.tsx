import { IntlDate } from '~/components/ui/intl-date';

/** A `YYYY-MM-DD` day: no time, no zone, the same day for every viewer. */
export function IntlDateDay() {
  return (
    <span className='text-body'>
      <IntlDate date='2025-03-14' />
    </span>
  );
}
