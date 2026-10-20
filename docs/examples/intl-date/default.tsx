import { IntlDate } from '~/components/ui/intl-date';

/** An ISO moment in the viewer's time zone: the default, then two `format`s. */
export function IntlDateDefault() {
  const sentAt = '2025-03-14T09:30:00Z';
  return (
    <div className='flex flex-col gap-1 text-body'>
      <IntlDate date={sentAt} />
      <IntlDate date={sentAt} format={{ dateStyle: 'long', timeStyle: 'short' }} />
      <IntlDate date={sentAt} format={{ day: 'numeric', month: 'short' }} />
    </div>
  );
}
