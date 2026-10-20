import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

// `suppressHydrationWarning`: the server formats in its own zone and at its own time, so the text may differ.

/** BCP 47 locale (default `en-US`) and IANA time zone (default: the runtime's) of every formatter here. */
interface FormatProps {
  locale?: string;
  timeZone?: string;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A `YYYY-MM-DD` day has no zone: read at UTC midnight and formatted in UTC, it is the same day for every viewer. Any
 * other ISO string is a moment, shown in `timeZone`.
 */
const toFormatInput = (iso: string, timeZone: string | undefined) =>
  DAY.test(iso)
    ? { date: new Date(`${iso}T00:00:00Z`), timeZone: 'UTC', isDay: true }
    : { date: new Date(iso), timeZone, isDay: false };

const DATE: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
const DATE_TIME: Intl.DateTimeFormatOptions = { ...DATE, hour: 'numeric', minute: '2-digit' };

/** Formats a day or a moment: `format` defaults to the medium date, plus the time for a moment. */
function formatIntlDate(
  iso: string,
  { locale = 'en-US', timeZone, format }: FormatProps & { format?: Intl.DateTimeFormatOptions },
) {
  const input = toFormatInput(iso, timeZone);
  return new Intl.DateTimeFormat(locale, {
    ...(format ?? (input.isDay ? DATE : DATE_TIME)),
    timeZone: input.timeZone,
  }).format(input.date);
}

/** A date for reading. `date` is a day (`YYYY-MM-DD`, the same for every viewer) or an ISO moment (in `timeZone`). */
function IntlDate({
  date,
  format,
  locale,
  timeZone,
}: FormatProps & { date: string; format?: Intl.DateTimeFormatOptions }) {
  return (
    <time suppressHydrationWarning dateTime={date}>
      {formatIntlDate(date, { locale, timeZone, format })}
    </time>
  );
}

/** Two days or two moments as one range ("Mar 10 – 14, 2025"), shared parts said once. */
function IntlDateRange({
  start,
  end,
  format,
  locale = 'en-US',
  timeZone,
}: FormatProps & { start: string; end: string; format?: Intl.DateTimeFormatOptions }) {
  const from = toFormatInput(start, timeZone);
  const to = toFormatInput(end, timeZone);
  const formatter = new Intl.DateTimeFormat(locale, {
    ...(format ?? (from.isDay ? DATE : DATE_TIME)),
    timeZone: from.timeZone,
  });
  return (
    <time suppressHydrationWarning dateTime={start}>
      {formatter.formatRange(from.date, to.date)}
    </time>
  );
}

const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/** The largest whole unit of `ms`; under a minute is "now" (0 minutes). */
function relativeParts(ms: number): [number, Intl.RelativeTimeFormatUnit] {
  for (const [unit, size] of UNITS) {
    if (Math.abs(ms) >= size) return [Math.trunc(ms / size), unit];
  }
  return [0, 'minute'];
}

/** A moment as how long ago or how far ahead ("2 hours ago"), the exact moment in a tooltip. */
function RelativeIntlDate({ date, locale = 'en-US', timeZone }: FormatProps & { date: string }) {
  const [value, unit] = relativeParts(new Date(date).getTime() - Date.now());
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time suppressHydrationWarning dateTime={date}>
            {new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit)}
          </time>
        }
      />
      <TooltipContent>
        <IntlDate date={date} locale={locale} timeZone={timeZone} />
      </TooltipContent>
    </Tooltip>
  );
}

export { IntlDate, IntlDateRange, RelativeIntlDate };
