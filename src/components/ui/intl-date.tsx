import { DateTime, Interval } from 'luxon';

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import type { IsoDate } from '~/lib/iso-date';
import { useUiConfig } from '~/lib/ui-config';

// `suppressHydrationWarning`: the server formats in its own zone and at its own time, so the text may differ.

/** A moment, in the user's time zone and locale. */
export function IntlDate({
  date,
  format = DateTime.DATETIME_MED,
}: {
  date: Date;
  format?: Intl.DateTimeFormatOptions;
}) {
  const { locale, timeZone } = useUiConfig();
  return (
    <time suppressHydrationWarning dateTime={date.toISOString()}>
      {DateTime.fromJSDate(date, { zone: timeZone }).toLocaleString(format, { locale })}
    </time>
  );
}

/** A calendar date has no zone: it renders as the same day for every viewer, unlike `IntlDate`. */
export function IsoIntlDate({
  date,
  format = DateTime.DATE_MED,
}: {
  date: IsoDate;
  format?: Intl.DateTimeFormatOptions;
}) {
  const { locale } = useUiConfig();
  return (
    <time suppressHydrationWarning dateTime={date}>
      {DateTime.fromISO(date).toLocaleString(format, { locale })}
    </time>
  );
}

/** How long ago („vor 2 Stunden“), the exact moment in a tooltip. */
export function RelativeIntlDate({ date }: { date: Date }) {
  const { locale, timeZone } = useUiConfig();
  const dateTime = DateTime.fromJSDate(date, { zone: timeZone });
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time suppressHydrationWarning dateTime={date.toISOString()}>
            {dateTime.toRelative({ locale, padding: 60_000 }) ??
              dateTime.toLocaleString(DateTime.DATETIME_MED, { locale })}
          </time>
        }
      />
      <TooltipContent>
        <IntlDate date={date} />
      </TooltipContent>
    </Tooltip>
  );
}

/** Pure (no hooks) so it can be used server-side, e.g. in notification renderers. */
export const renderDateRange = (
  start: Date,
  end: Date,
  format: Intl.DateTimeFormatOptions = DateTime.DATE_MED,
  locale = 'de',
): string =>
  Interval.fromDateTimes(DateTime.fromJSDate(start), DateTime.fromJSDate(end)).toLocaleString(format, {
    locale,
  });
