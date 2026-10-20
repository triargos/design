import { IntlDate } from '~/components/ui/intl-date';

/** Relative; the exact moment in a tooltip. */
export function IntlDateRelative() {
  return (
    <span className='text-body'>
      <IntlDate relative date={new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()} />
    </span>
  );
}
