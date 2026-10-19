import { IntlDate } from '~/components/ui/intl-date';

/** A `Date` in the user’s locale. Format for reading with intl-date, never by hand. */
export function IntlDateDefault() {
  const sentAt = new Date(2025, 2, 14, 9, 30);
  return (
    <div className='flex flex-col gap-1 text-body'>
      <IntlDate date={sentAt} />
      <IntlDate date={sentAt} format={{ dateStyle: 'long', timeStyle: 'short' }} />
      <IntlDate date={sentAt} format={{ day: 'numeric', month: 'short' }} />
    </div>
  );
}
