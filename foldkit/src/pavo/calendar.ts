import { Calendar as CalendarPrimitive } from '@foldkit/ui';
import { Array, Match, Option, Predicate, Schema, pipe } from 'effect';
import { cva } from 'class-variance-authority';
import * as FoldkitCalendar from 'foldkit/calendar';
import type { CalendarDate } from 'foldkit/calendar';
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { buttonVariants } from './button.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { PartAttribute } from './part.ts';

export const { Model, Message, OutMessage, init, update, focusDate, FocusGrid } = CalendarPrimitive;
export type Model = CalendarPrimitive.Model;
export type Message = CalendarPrimitive.Message;
export type OutMessage = CalendarPrimitive.OutMessage;

const SAMPLE_YEAR = 2025;
const SAMPLE_SUNDAY = Date.UTC(2023, 0, 1);
const MILLIS_PER_DAY = 86_400_000;
const SAMPLE_DATE = Date.UTC(SAMPLE_YEAR, 2, 14);

const monthNames = (locale: string, month: 'long' | 'short') => {
  const formatter = new Intl.DateTimeFormat(locale, { month, timeZone: 'UTC' });
  const name = (monthIndex: number): string => formatter.format(Date.UTC(SAMPLE_YEAR, monthIndex, 1));
  return [
    name(0),
    name(1),
    name(2),
    name(3),
    name(4),
    name(5),
    name(6),
    name(7),
    name(8),
    name(9),
    name(10),
    name(11),
  ] as const;
};

const dayNames = (locale: string, weekday: 'long' | 'short') => {
  const formatter = new Intl.DateTimeFormat(locale, { weekday, timeZone: 'UTC' });
  const name = (dayIndex: number): string => formatter.format(SAMPLE_SUNDAY + dayIndex * MILLIS_PER_DAY);
  return [name(0), name(1), name(2), name(3), name(4), name(5), name(6)] as const;
};

const DAYS_OF_WEEK_FROM_MONDAY: ReadonlyArray<FoldkitCalendar.DayOfWeek> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type WeekInfoLocale = Intl.Locale &
  Readonly<{ getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }>;

const firstDayOfWeek = (locale: string): FoldkitCalendar.DayOfWeek => {
  const intlLocale: WeekInfoLocale = new Intl.Locale(locale);
  const maybeFirstDay = Option.fromNullishOr(intlLocale.getWeekInfo?.().firstDay ?? intlLocale.weekInfo?.firstDay);
  return pipe(
    maybeFirstDay,
    Option.flatMap((firstDay) => Array.get(DAYS_OF_WEEK_FROM_MONDAY, firstDay - 1)),
    Option.getOrElse((): FoldkitCalendar.DayOfWeek => 'Sunday'),
  );
};

type MonthStyle = 'MonthName' | 'ShortMonthName';

const toDatePart = (part: Intl.DateTimeFormatPart, monthStyle: MonthStyle): FoldkitCalendar.DatePart =>
  Match.value(part.type).pipe(
    Match.withReturnType<FoldkitCalendar.DatePart>(),
    Match.when('month', () =>
      monthStyle === 'MonthName' ? FoldkitCalendar.DatePart.MonthName() : FoldkitCalendar.DatePart.ShortMonthName(),
    ),
    Match.when('day', () =>
      part.value.length === 2 && part.value.startsWith('0')
        ? FoldkitCalendar.DatePart.PaddedDayNumber()
        : FoldkitCalendar.DatePart.DayNumber(),
    ),
    Match.when('year', () => FoldkitCalendar.DatePart.YearNumber()),
    Match.when('weekday', () => FoldkitCalendar.DatePart.DayName()),
    Match.orElse(() => FoldkitCalendar.DatePart.LiteralText({ text: part.value })),
  );

const dateFormat = (
  locale: string,
  options: Intl.DateTimeFormatOptions,
  monthStyle: MonthStyle,
  fallback: FoldkitCalendar.DateFormat,
): FoldkitCalendar.DateFormat =>
  pipe(
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).formatToParts(SAMPLE_DATE),
    Array.map((part) => toDatePart(part, monthStyle)),
    Option.liftPredicate(Array.isArrayNonEmpty),
    Option.getOrElse(() => fallback),
  );

const isMonthYearPart = (part: FoldkitCalendar.DatePart): part is FoldkitCalendar.MonthYearFormat[number] =>
  part._tag === 'MonthName' ||
  part._tag === 'ShortMonthName' ||
  part._tag === 'MonthNumber' ||
  part._tag === 'PaddedMonthNumber' ||
  part._tag === 'YearNumber' ||
  part._tag === 'LiteralText';

const monthYearFormat = (locale: string): FoldkitCalendar.MonthYearFormat =>
  pipe(
    dateFormat(
      locale,
      { month: 'long', year: 'numeric' },
      'MonthName',
      FoldkitCalendar.defaultEnglishLocale.longFormat,
    ),
    Array.filter(isMonthYearPart),
    Option.liftPredicate(Array.isArrayNonEmpty),
    Option.getOrElse(() => FoldkitCalendar.defaultEnglishLocale.monthYearFormat),
  );

export const localeConfig = (locale: string): FoldkitCalendar.LocaleConfig => {
  const fallback = FoldkitCalendar.defaultEnglishLocale;
  return {
    firstDayOfWeek: firstDayOfWeek(locale),
    monthNames: monthNames(locale, 'long'),
    shortMonthNames: monthNames(locale, 'short'),
    dayNames: dayNames(locale, 'long'),
    shortDayNames: dayNames(locale, 'short'),
    longFormat: dateFormat(locale, { dateStyle: 'long' }, 'MonthName', fallback.longFormat),
    shortFormat: dateFormat(
      locale,
      { month: 'short', day: 'numeric', year: 'numeric' },
      'ShortMonthName',
      fallback.shortFormat,
    ),
    ariaLabelFormat: dateFormat(
      locale,
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      'MonthName',
      fallback.ariaLabelFormat,
    ),
    monthYearFormat: monthYearFormat(locale),
  };
};

export const DateRange = Schema.Struct({
  start: FoldkitCalendar.CalendarDate,
  end: FoldkitCalendar.CalendarDate,
});
export type DateRange = typeof DateRange.Type;

export const RangeSelection = Schema.Struct({
  maybeRange: Schema.Option(DateRange),
  maybeAnchor: Schema.Option(FoldkitCalendar.CalendarDate),
});
export type RangeSelection = typeof RangeSelection.Type;

export const initRangeSelection = (maybeRange: Option.Option<DateRange>): RangeSelection => ({
  maybeRange,
  maybeAnchor: Option.none(),
});

const orderedRange = (first: CalendarDate, second: CalendarDate): DateRange => ({
  start: FoldkitCalendar.min(first, second),
  end: FoldkitCalendar.max(first, second),
});

export const selectRangeDate = (selection: RangeSelection, date: CalendarDate): RangeSelection =>
  Option.match(selection.maybeAnchor, {
    onNone: () => ({ maybeRange: selection.maybeRange, maybeAnchor: Option.some(date) }),
    onSome: (anchor) => ({ maybeRange: Option.some(orderedRange(anchor, date)), maybeAnchor: Option.none() }),
  });

const displayedRange = (selection: RangeSelection): Option.Option<DateRange> =>
  Option.match(selection.maybeAnchor, {
    onNone: () => selection.maybeRange,
    onSome: (anchor) => Option.some({ start: anchor, end: anchor }),
  });

export type CalendarMode = 'single' | 'range';

const calendarDayVariants = cva(
  [
    'flex size-full items-center justify-center rounded-control text-body leading-none',
    'transition-colors duration-feedback group-hover/day:bg-highlight',
    'group-data-focused/day:ring-3 group-data-focused/day:ring-ring/24',
    'group-data-today/day:bg-foreground/6 group-data-today/day:font-medium',
    'group-data-outside-month/day:text-muted-foreground group-data-disabled/day:text-disabled-foreground',
  ],
  {
    variants: {
      mode: {
        single: 'group-data-selected/day:bg-primary-solid group-data-selected/day:text-primary-solid-foreground',
        range: [
          'group-data-selection-start/day:bg-primary-solid group-data-selection-start/day:text-primary-solid-foreground',
          'group-data-selection-end/day:bg-primary-solid group-data-selection-end/day:text-primary-solid-foreground',
        ],
      },
    },
    defaultVariants: { mode: 'single' },
  },
);

const navButtonClassName = cn(
  buttonVariants({ intent: 'neutral', emphasis: 'ghost' }),
  'size-(--cell-size) rounded-control p-0 select-none hover:bg-highlight disabled:text-disabled-foreground',
);

const pickerCellClassName =
  'flex h-(--cell-size) w-full items-center justify-center rounded-control text-body transition-colors duration-feedback hover:bg-highlight data-selected:bg-primary-solid data-selected:text-primary-solid-foreground';

type BaseViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  className?: string | undefined;
  previousMonthLabel?: string | undefined;
  nextMonthLabel?: string | undefined;
}>;

type SingleConfig = Readonly<{ mode?: 'single'; maybeSelectedDate: Option.Option<CalendarDate> }>;
type RangeConfig = Readonly<{ mode: 'range'; rangeSelection: RangeSelection }>;

export type ViewConfig<ParentMessage> = BaseViewConfig<ParentMessage> & (SingleConfig | RangeConfig);

const rangeCellAttributes = <ParentMessage>(
  maybeRange: Option.Option<DateRange>,
  date: CalendarDate,
  h: HtmlBuilder<ParentMessage>,
): ReadonlyArray<PartAttribute<ParentMessage>> =>
  Option.match(maybeRange, {
    onNone: () => [],
    onSome: ({ start, end }) =>
      FoldkitCalendar.isBefore(date, start) || FoldkitCalendar.isAfter(date, end)
        ? []
        : [
            h.DataAttribute('selected', ''),
            h.AriaSelected(true),
            ...(FoldkitCalendar.isEqual(date, start) ? [h.DataAttribute('selection-start', '')] : []),
            ...(FoldkitCalendar.isEqual(date, end) ? [h.DataAttribute('selection-end', '')] : []),
          ],
  });

export type ToViewConfig = Readonly<{
  mode?: CalendarMode | undefined;
  maybeRange?: Option.Option<DateRange> | undefined;
  className?: string | undefined;
}>;

export const toView = <ParentMessage>(
  { mode = 'single', maybeRange = Option.none(), className }: ToViewConfig,
  h: HtmlBuilder<ParentMessage>,
): ((attributes: CalendarPrimitive.CalendarAttributes) => Html) => {
  const rootAttributes = (root: ReadonlyArray<ChildAttribute>): ReadonlyArray<PartAttribute<ParentMessage>> => [
    ...root,
    h.DataAttribute('slot', 'calendar'),
    h.DataAttribute('mode', mode),
    h.Class(cn('w-fit p-picker select-none [--cell-size:var(--spacing-control)]', className)),
  ];
  const header = (
    previousButton: ReadonlyArray<ChildAttribute>,
    nextButton: ReadonlyArray<ChildAttribute>,
    heading: Readonly<{ id: string; text: string }>,
  ): Html =>
    h.header(
      [h.Class('mb-part flex h-(--cell-size) items-center justify-between gap-control-gap-sm')],
      [
        h.button([...previousButton, h.Class(navButtonClassName)], [icon('chevron-left', { className: 'size-icon' })]),
        h.h2([h.Id(heading.id), h.AriaLive('polite'), h.Class('text-body font-medium select-none')], [heading.text]),
        h.button([...nextButton, h.Class(navButtonClassName)], [icon('chevron-right', { className: 'size-icon' })]),
      ],
    );

  const dayCell = (cell: CalendarPrimitive.DayCell): Html =>
    h.div(
      [
        ...cell.cellAttributes,
        ...rangeCellAttributes(maybeRange, cell.date, h),
        h.DataAttribute('mode', mode),
        h.Class(
          'group/day relative size-(--cell-size) outline-none select-none data-disabled:pointer-events-none data-selected:data-[mode=range]:bg-foreground/6 data-selection-end:rounded-r-control data-selection-start:rounded-l-control',
        ),
      ],
      [h.button([...cell.buttonAttributes, h.Class(cn(calendarDayVariants({ mode }), 'outline-none'))], [cell.label])],
    );

  const daysView = (days: CalendarPrimitive.DaysModeAttributes): Html =>
    h.div(rootAttributes(days.root), [
      header(days.previousMonthButton, days.nextMonthButton, days.heading),
      h.div(
        [...days.grid, h.Class('flex flex-col gap-related outline-none')],
        [
          h.div(
            [...days.headerRow, h.Class('flex')],
            Array.map(days.columnHeaders, (columnHeader) =>
              h.div(
                [
                  ...columnHeader.attributes,
                  h.Class('w-(--cell-size) p-0 text-center text-caption font-normal text-muted-foreground select-none'),
                ],
                [columnHeader.name],
              ),
            ),
          ),
          ...Array.map(days.weeks, (week) =>
            h.div([...week.attributes, h.Class('flex')], Array.map(week.cells, dayCell)),
          ),
        ],
      ),
    ]);

  const pickerGrid = (
    grid: ReadonlyArray<ChildAttribute>,
    cells: ReadonlyArray<
      Readonly<{
        label: string;
        cellAttributes: ReadonlyArray<ChildAttribute>;
        buttonAttributes: ReadonlyArray<ChildAttribute>;
      }>
    >,
  ): Html =>
    h.div(
      [...grid, h.Class('grid w-[calc(var(--cell-size)*7)] grid-cols-3 gap-related outline-none')],
      Array.map(cells, (cell) =>
        h.div(
          [...cell.cellAttributes, h.Class('group/cell')],
          [h.button([...cell.buttonAttributes, h.Class(pickerCellClassName)], [cell.label])],
        ),
      ),
    );

  const monthsView = (months: CalendarPrimitive.MonthsModeAttributes): Html =>
    h.div(rootAttributes(months.root), [
      h.header(
        [h.Class('mb-part flex h-(--cell-size) items-center justify-center')],
        [h.button([...months.headingButton, h.Class('text-body font-medium')], [months.heading.text])],
      ),
      pickerGrid(
        months.grid,
        Array.map(months.cells, (cell) => ({ ...cell, label: cell.shortLabel })),
      ),
    ]);

  const yearsView = (years: CalendarPrimitive.YearsModeAttributes): Html =>
    h.div(rootAttributes(years.root), [
      header(years.previousPageButton, years.nextPageButton, years.heading),
      pickerGrid(years.grid, years.cells),
    ]);

  return Match.type<CalendarPrimitive.CalendarAttributes>().pipe(
    Match.tagsExhaustive({ Days: daysView, Months: monthsView, Years: yearsView }),
  );
};

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, className, previousMonthLabel, nextMonthLabel } = config;
  const mode: CalendarMode = config.mode ?? 'single';
  const maybeRange = config.mode === 'range' ? displayedRange(config.rangeSelection) : Option.none();
  const maybeSelectedDate = config.mode === 'range' ? Option.none() : config.maybeSelectedDate;

  return h.submodel({
    slotId: model.id,
    model,
    view: CalendarPrimitive.view,
    viewInputs: {
      maybeSelectedDate,
      toView: toView({ mode, maybeRange, className }, h),
      ...(Predicate.isUndefined(previousMonthLabel) ? {} : { previousMonthLabel }),
      ...(Predicate.isUndefined(nextMonthLabel) ? {} : { nextMonthLabel }),
    },
    toParentMessage,
  });
};
