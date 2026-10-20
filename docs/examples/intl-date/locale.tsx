import { IntlDate } from '~/components/ui/intl-date';

/** `locale` and `timeZone` on each formatter; without them, en-US in the runtime's zone. */
export function IntlDateLocale() {
  const sentAt = '2025-03-14T09:30:00Z';
  return (
    <div className='flex flex-col gap-1 text-body'>
      <IntlDate date={sentAt} locale='en-GB' timeZone='Europe/London' />
      <IntlDate date={sentAt} locale='de-DE' timeZone='Europe/Berlin' />
      <IntlDate date={sentAt} locale='ja-JP' timeZone='Asia/Tokyo' />
    </div>
  );
}
