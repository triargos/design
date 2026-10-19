import { DateTime, Interval } from 'luxon';

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip.tsx';

import type { IsoDate } from '~/lib/iso-date';
import { useUiConfig } from '~/lib/ui-config';

const useLocale = () => useUiConfig().locale;
const useTimezone = () => useUiConfig().timeZone;

type IntlDateProps = {
  date: Date;
  format?: Intl.DateTimeFormatOptions;
};

export const IntlDate = ({ date, format }: IntlDateProps) => {
  const timeZone = useTimezone();
  const dateTime = DateTime.fromJSDate(date, { zone: timeZone });
  const defaultFormat = DateTime.DATETIME_MED;
  const locale = useLocale();
  return (
    <time suppressHydrationWarning={true} dateTime={date.toISOString()}>
      {dateTime.toLocaleString(format ?? defaultFormat, {
        locale,
      })}
    </time>
  );
};

/** A calendar date has no zone — it renders as the same day for every viewer, unlike IntlDate. */
export const IsoIntlDate = ({ date, format }: { date: IsoDate; format?: Intl.DateTimeFormatOptions }) => {
  const locale = useLocale();
  return (
    <time suppressHydrationWarning={true} dateTime={date}>
      {DateTime.fromISO(date).toLocaleString(format ?? DateTime.DATE_MED, { locale })}
    </time>
  );
};

export const RelativeIntlDate = ({ date }: { date: Date }) => {
  const timeZone = useTimezone();
  const dateTime = DateTime.fromJSDate(date, { zone: timeZone });
  const locale = useLocale();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time dateTime={date.toISOString()}>
            {dateTime.toRelative({ locale, padding: 1000 * 60 }) ??
              dateTime.toLocaleString(DateTime.DATETIME_MED, { locale })}
          </time>
        }
      />
      <TooltipContent>
        <IntlDate date={date} />
      </TooltipContent>
    </Tooltip>
  );
};

export function useRenderDate() {
  const locale = useLocale();
  const timeZone = useTimezone();
  return ({ date, format }: IntlDateProps) => {
    const dateTime = DateTime.fromJSDate(date, { zone: timeZone });
    return dateTime.toLocaleString(format ?? DateTime.DATETIME_MED, { locale });
  };
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
