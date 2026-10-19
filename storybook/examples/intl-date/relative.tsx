import { RelativeIntlDate } from '~/components/ui/intl-date';

/** Relative; the exact time in a tooltip. */
export function IntlDateRelative() {
  return (
    <span className='text-body'>
      <RelativeIntlDate date={new Date(Date.now() - 2 * 60 * 60 * 1000)} />
    </span>
  );
}
