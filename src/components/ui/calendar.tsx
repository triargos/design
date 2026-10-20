import { type CalendarDate, parseDate } from '@internationalized/date';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Calendar as CalendarRac,
  Heading,
} from 'react-aria-components/Calendar';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import { RangeCalendar as RangeCalendarRac } from 'react-aria-components/RangeCalendar';

import { buttonVariants } from '~/components/ui/button';

import { cn } from '~/lib/utils';

/** A day as `YYYY-MM-DD`, or `''` for none. */
const toDate = (value: string | undefined): CalendarDate | null => (value ? parseDate(value) : null);

interface CalendarBaseProps {
  /** Earliest and latest day that can be picked, `YYYY-MM-DD`; days outside are disabled. */
  min?: string;
  max?: string;
  /** Focuses the selected day (or today) on mount: for a calendar that opens in a popup. */
  autoFocus?: boolean;
  /** BCP 47; sets the month names, weekday names and the first day of the week. */
  locale?: string;
  className?: string;
}

const rootClassName = 'w-fit p-3 [--cell-size:2.25rem]';

const navButtonClassName = cn(
  buttonVariants({ intent: 'neutral', emphasis: 'ghost' }),
  'size-(--cell-size) rounded-control p-0 select-none hover:bg-foreground/6 disabled:text-disabled-foreground dark:hover:bg-foreground/6',
);

/**
 * The day cell carries a range's band (the days between its ends); the day inside it is the target. The selected day
 * (a range's start and end) takes the brand fill; today is a quiet fill. Days outside the month are muted, disabled
 * days `disabled-foreground`.
 */
const cellClassName = cn(
  'group/day relative size-(--cell-size) outline-none select-none data-disabled:pointer-events-none',
  'data-selected:data-[range]:bg-foreground/6 data-selection-start:rounded-l-control data-selection-end:rounded-r-control',
);
const dayClassName = cn(
  'flex size-full items-center justify-center rounded-control text-body leading-none',
  'transition-colors duration-feedback group-hover/day:bg-foreground/6',
  'group-data-focus-visible/day:ring-3 group-data-focus-visible/day:ring-ring/24',
  'group-data-today/day:bg-foreground/6 group-data-today/day:font-medium',
  'group-data-outside-month/day:text-muted-foreground group-data-disabled/day:text-disabled-foreground',
);
const selectedDayClassName = {
  single: 'group-data-selected/day:bg-primary-solid group-data-selected/day:text-primary-solid-foreground',
  range: cn(
    'group-data-selection-start/day:bg-primary-solid group-data-selection-start/day:text-primary-solid-foreground',
    'group-data-selection-end/day:bg-primary-solid group-data-selection-end/day:text-primary-solid-foreground',
  ),
};

/** Header (previous, month, next) and the month grid, shared by both calendars. */
function CalendarMonth({ range = false }: { range?: boolean }) {
  return (
    <>
      <header className='mb-4 flex h-(--cell-size) items-center justify-between gap-1'>
        <Button slot='previous' className={navButtonClassName}>
          <ChevronLeftIcon className='size-4' />
        </Button>
        <Heading className='text-body font-medium select-none' />
        <Button slot='next' className={navButtonClassName}>
          <ChevronRightIcon className='size-4' />
        </Button>
      </header>
      <CalendarGrid weekdayStyle='short' className='border-separate border-spacing-x-0 border-spacing-y-2 -my-2'>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className='p-0 text-caption font-normal text-muted-foreground select-none'>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <CalendarCell date={date} data-range={range || undefined} className={cellClassName}>
              {({ formattedDate }) => (
                <span className={cn(dayClassName, selectedDayClassName[range ? 'range' : 'single'])}>
                  {formattedDate}
                </span>
              )}
            </CalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </>
  );
}

/** A month to pick a day in. `value` is `YYYY-MM-DD` or `''`; it opens on the value's month. */
function Calendar({
  value,
  onValueChange,
  min,
  max,
  autoFocus,
  locale = 'en-US',
  className,
}: CalendarBaseProps & { value: string; onValueChange: (value: string) => void }) {
  return (
    <I18nProvider locale={locale}>
      <CalendarRac
        data-slot='calendar'
        value={toDate(value)}
        onChange={(date) => onValueChange(date.toString())}
        minValue={toDate(min)}
        maxValue={toDate(max)}
        autoFocus={autoFocus}
        className={cn(rootClassName, className)}>
        <CalendarMonth />
      </CalendarRac>
    </I18nProvider>
  );
}

/** Two days as `YYYY-MM-DD`, the first not after the second. */
interface DateRange {
  start: string;
  end: string;
}

/** A month to pick a range of days in: the first click sets the start, the second the end. */
function RangeCalendar({
  value,
  onValueChange,
  min,
  max,
  autoFocus,
  locale = 'en-US',
  className,
}: CalendarBaseProps & { value: DateRange | null; onValueChange: (value: DateRange) => void }) {
  return (
    <I18nProvider locale={locale}>
      <RangeCalendarRac
        data-slot='calendar'
        value={value && { start: parseDate(value.start), end: parseDate(value.end) }}
        onChange={(range) => onValueChange({ start: range.start.toString(), end: range.end.toString() })}
        minValue={toDate(min)}
        maxValue={toDate(max)}
        autoFocus={autoFocus}
        className={cn(rootClassName, className)}>
        <CalendarMonth range />
      </RangeCalendarRac>
    </I18nProvider>
  );
}

export { Calendar, RangeCalendar, type DateRange };
