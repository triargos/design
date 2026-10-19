import * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Schema from 'effect/Schema';

/**
 * Parse-format round-trip. The formatter emits exactly `YYYY-MM-DD`, so equality enforces the
 * shape, and overflow dates like `2026-02-30` parse (rolled into March) but format back differently.
 */
const isCalendarDate = (value: string) =>
  Option.exists(DateTime.make(value), (dt) => DateTime.formatIsoDateUtc(dt) === value);

const IsoDateSchema = Schema.String.pipe(
  Schema.check(
    Schema.makeFilter(isCalendarDate, {
      identifier: 'IsoDate',
      description: 'a calendar date in YYYY-MM-DD format',
    }),
  ),
  Schema.brand('@elternportal/IsoDate'),
);

/** Viewed in the environment's timezone — the zone a calendar picker and "today" mean. */
const inLocalZone = (dt: DateTime.DateTime) => DateTime.setZone(dt, DateTime.zoneMakeLocal());

type IsoDateBrand = typeof IsoDateSchema.Type;

/** Lexicographic — `YYYY-MM-DD` sorts as a string, so the string order is the day order. */
const isoDateOrder: Order.Order<IsoDateBrand> = Order.String;

export const IsoDate = Object.assign(IsoDateSchema, {
  /** Calendar date of `date` as the user sees it locally — what a calendar picker means. */
  fromDate: (date: Date): IsoDate =>
    IsoDateSchema.make(DateTime.formatIsoDate(inLocalZone(DateTime.fromDateUnsafe(date)))),

  /** UTC calendar date of `date` — for instants that encode a `YYYY-MM-DD` as UTC midnight. */
  fromDateUtc: (date: Date): IsoDate => IsoDateSchema.make(DateTime.formatIsoDateUtc(DateTime.fromDateUnsafe(date))),

  fromInstant: (instant: string): IsoDate | null => {
    if (instant === '') return null;
    const date = new Date(instant);
    return Number.isNaN(date.getTime()) ? null : IsoDate.fromDate(date);
  },

  /** Local-midnight ISO instant of the date; `null` becomes `''`. Inverse of `fromInstant` for form state that stores instants. */
  toInstant: (date: IsoDate | null): string => (date === null ? '' : IsoDate.toDate(date).toISOString()),

  today: Effect.map(DateTime.now, (now) => IsoDateSchema.make(DateTime.formatIsoDate(inLocalZone(now)))),

  /** Local midnight of the calendar date — `T00:00:00` without an offset parses as local time. */
  toDate: (iso: IsoDate): Date => new Date(`${iso}T00:00:00`),

  /** UTC midnight of the calendar date — for boundaries that store a `YYYY-MM-DD` as an instant. */
  toDateUtc: (iso: IsoDate): Date => new Date(`${iso}T00:00:00Z`),

  /** Shift a calendar date without local-time or daylight-saving effects. */
  addDays: (args: { readonly date: IsoDate; readonly days: number }): IsoDate => {
    const shifted = IsoDate.toDateUtc(args.date);
    shifted.setUTCDate(shifted.getUTCDate() + args.days);
    return IsoDate.fromDateUtc(shifted);
  },

  /** `to` minus `from` in whole days. ISO date strings parse as UTC midnight, so this is exact. */
  daysBetween: (args: { from: IsoDate; to: IsoDate }): number =>
    (Date.parse(args.to) - Date.parse(args.from)) / 86_400_000,

  Order: isoDateOrder,
});

export type IsoDate = typeof IsoDateSchema.Type;

export interface IsoDateRange {
  readonly min: IsoDate;
  readonly max: IsoDate;
}

/**
 * Wall clock, not the Effect clock: range callers are browser components and sync `Schema.makeFilter`
 * validators, where no Effect runtime exists. `add` on a zoned value shifts the wall-clock date.
 */
const yearsFromToday = (years: number): IsoDate =>
  IsoDateSchema.make(DateTime.formatIsoDate(DateTime.add(inLocalZone(DateTime.nowUnsafe()), { years })));

export const IsoDateRange = {
  /** Window around today, wall clock, computed per call — no stale ceiling in long-lived tabs. */
  yearsAround: (back: number, ahead: number): IsoDateRange => ({
    min: yearsFromToday(-back),
    max: yearsFromToday(ahead),
  }),

  /**
   * Sanity window for any hand-typed date: a typo year like `0202` falls out, birth dates do not.
   * 1900-01-01 → today+10y, computed per call.
   */
  default: (): IsoDateRange => ({
    min: IsoDateSchema.make('1900-01-01'),
    max: yearsFromToday(10),
  }),

  contains:
    (range: IsoDateRange) =>
    (date: IsoDate): boolean =>
      date >= range.min && date <= range.max,

  /**
   * THE range rule for date schemas — `DateInput` only drives the calendar with `min`/`max`, so
   * this refinement is the only thing that rejects an out-of-range typed date.
   *
   * `range` is called per validation: a long-lived tab must not validate against yesterday's
   * ceiling. `message` is a plain string; the app passes `msg(...)` (a string subtype).
   */
  filter:
    (range: () => IsoDateRange, message: string) =>
    <I, RD, RE>(self: Schema.Codec<IsoDate, I, RD, RE>) =>
      self.check(Schema.makeFilter((date) => IsoDateRange.contains(range())(date), { message })),
};
