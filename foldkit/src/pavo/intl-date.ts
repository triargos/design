import { Array, DateTime, Option, pipe } from 'effect';
import type { CalendarDate } from 'foldkit/calendar';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { PartAttribute } from './part.ts';

export const DEFAULT_LOCALE = 'en-US';

const DATE: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
const DATE_TIME: Intl.DateTimeFormatOptions = { ...DATE, hour: 'numeric', minute: '2-digit' };

const MILLIS_PER_MINUTE = 60_000;
const MILLIS_PER_HOUR = 60 * MILLIS_PER_MINUTE;
const MILLIS_PER_DAY = 24 * MILLIS_PER_HOUR;

const UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * MILLIS_PER_DAY],
  ['month', 30 * MILLIS_PER_DAY],
  ['week', 7 * MILLIS_PER_DAY],
  ['day', MILLIS_PER_DAY],
  ['hour', MILLIS_PER_HOUR],
  ['minute', MILLIS_PER_MINUTE],
];

type RelativeParts = readonly [number, Intl.RelativeTimeFormatUnit];

const relativeParts = (millis: number): RelativeParts =>
  pipe(
    UNITS,
    Array.findFirst(([, size]) => Math.abs(millis) >= size),
    Option.map(([unit, size]): RelativeParts => [Math.trunc(millis / size), unit]),
    Option.getOrElse((): RelativeParts => [0, 'minute']),
  );

const pad = (value: number, length: number): string => String(value).padStart(length, '0');

export const toIsoDay = ({ year, month, day }: CalendarDate): string =>
  `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;

const dayToUtcDate = ({ year, month, day }: CalendarDate): Date => new Date(Date.UTC(year, month - 1, day));

type FormatConfig = Readonly<{
  locale?: string | undefined;
  className?: string | undefined;
}>;

const timeElement = <Message>(
  dateTime: string,
  text: string,
  className: string | undefined,
  h: HtmlBuilder<Message>,
  attributes: ReadonlyArray<PartAttribute<Message>> = [],
): Html =>
  h.time(
    [
      h.DataAttribute('slot', 'intl-date'),
      h.Datetime(dateTime),
      ...(className === undefined ? [] : [h.Class(className)]),
      ...attributes,
    ],
    [text],
  );

export type DayConfig = FormatConfig &
  Readonly<{
    date: CalendarDate;
    end?: CalendarDate | undefined;
    format?: Intl.DateTimeFormatOptions | undefined;
  }>;

export const formatDay = ({ date, end, format = DATE, locale = DEFAULT_LOCALE }: DayConfig): string => {
  const formatter = new Intl.DateTimeFormat(locale, { ...format, timeZone: 'UTC' });
  return end === undefined
    ? formatter.format(dayToUtcDate(date))
    : formatter.formatRange(dayToUtcDate(date), dayToUtcDate(end));
};

export const day = <Message>(config: DayConfig, h: HtmlBuilder<Message>): Html =>
  timeElement(toIsoDay(config.date), formatDay(config), config.className, h);

export type MomentConfig = FormatConfig &
  Readonly<{
    date: DateTime.Utc;
    end?: DateTime.Utc | undefined;
    format?: Intl.DateTimeFormatOptions | undefined;
    timeZone?: string | undefined;
  }>;

export const formatMoment = ({
  date,
  end,
  format = DATE_TIME,
  locale = DEFAULT_LOCALE,
  timeZone,
}: MomentConfig): string => {
  const formatter = new Intl.DateTimeFormat(locale, { ...format, ...(timeZone === undefined ? {} : { timeZone }) });
  return end === undefined
    ? formatter.format(DateTime.toDateUtc(date))
    : formatter.formatRange(DateTime.toDateUtc(date), DateTime.toDateUtc(end));
};

export const moment = <Message>(config: MomentConfig, h: HtmlBuilder<Message>): Html =>
  timeElement(DateTime.formatIso(config.date), formatMoment(config), config.className, h);

export type RelativeConfig = FormatConfig &
  Readonly<{
    date: DateTime.Utc;
    now: DateTime.Utc;
    timeZone?: string | undefined;
  }>;

export const formatRelative = ({ date, now, locale = DEFAULT_LOCALE }: RelativeConfig): string => {
  const [value, unit] = relativeParts(DateTime.toEpochMillis(date) - DateTime.toEpochMillis(now));
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
};

export const relative = <Message>(config: RelativeConfig, h: HtmlBuilder<Message>): Html =>
  timeElement(DateTime.formatIso(config.date), formatRelative(config), config.className, h, [
    h.Title(formatMoment({ date: config.date, locale: config.locale, timeZone: config.timeZone })),
  ]);
