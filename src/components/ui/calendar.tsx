import { type CalendarDate, parseDate } from '@internationalized/date';
import { cva } from 'class-variance-authority';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  Calendar as AriaCalendar,
  Button as AriaCalendarButton,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
} from 'react-aria-components/Calendar';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import { RangeCalendar as AriaRangeCalendar } from 'react-aria-components/RangeCalendar';

import { buttonVariants } from '~/components/ui/button';

import { cn } from '~/lib/utils';

/** A day as `YYYY-MM-DD`, or `''` for none. */
const toDate = (value: string | undefined): CalendarDate | null => (value ? parseDate(value) : null);

/** Two days as `YYYY-MM-DD`, the first not after the second. */
interface DateRange {
  start: string;
  end: string;
}

type CalendarProps = {
  /** Earliest and latest day that can be picked, `YYYY-MM-DD`; days outside are disabled. */
  min?: string;
  max?: string;
  /** Focuses the selected day (or today) on mount: for a calendar that opens in a popup. */
  autoFocus?: boolean;
  /** BCP 47; sets the month names, weekday names and the first day of the week. */
  locale?: string;
  className?: string;
} & (
  | {
      /** One day: `YYYY-MM-DD`, or `''`. */
      mode?: 'single';
      value: string;
      onValueChange: (value: string) => void;
    }
  | {
      /** A range: the first click sets the start, the second the end. */
      mode: 'range';
      value: DateRange | null;
      onValueChange: (value: DateRange) => void;
    }
);

/**
 * The day inside a cell. The selected day (a range's start and end) takes the brand fill; today is a quiet fill. Days
 * outside the month are muted, disabled days `disabled-foreground`.
 */
const calendarDayVariants = cva(
  [
    'flex size-full items-center justify-center rounded-control text-body leading-none',
    'transition-colors duration-feedback group-hover/day:bg-foreground/6',
    'group-data-focus-visible/day:ring-3 group-data-focus-visible/day:ring-ring/24',
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

/** Header (previous, month, next) and the month grid. A range's cell carries the band between its ends. */
function CalendarMonth({ mode }: { mode: 'single' | 'range' }) {
  return (
    <>
      <header className='mb-4 flex h-(--cell-size) items-center justify-between gap-1'>
        <AriaCalendarButton
          slot='previous'
          className={cn(
            buttonVariants({ intent: 'neutral', emphasis: 'ghost' }),
            'size-(--cell-size) rounded-control p-0 select-none hover:bg-foreground/6 disabled:text-disabled-foreground dark:hover:bg-foreground/6',
          )}>
          <ChevronLeftIcon className='size-4' />
        </AriaCalendarButton>
        <Heading className='text-body font-medium select-none' />
        <AriaCalendarButton
          slot='next'
          className={cn(
            buttonVariants({ intent: 'neutral', emphasis: 'ghost' }),
            'size-(--cell-size) rounded-control p-0 select-none hover:bg-foreground/6 disabled:text-disabled-foreground dark:hover:bg-foreground/6',
          )}>
          <ChevronRightIcon className='size-4' />
        </AriaCalendarButton>
      </header>
      <CalendarGrid weekdayStyle='short' className='-my-2 border-separate border-spacing-x-0 border-spacing-y-2'>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className='p-0 text-caption font-normal text-muted-foreground select-none'>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <CalendarCell
              date={date}
              data-mode={mode}
              className='group/day relative size-(--cell-size) outline-none select-none data-disabled:pointer-events-none data-selected:data-[mode=range]:bg-foreground/6 data-selection-end:rounded-r-control data-selection-start:rounded-l-control'>
              {({ formattedDate }) => <span className={calendarDayVariants({ mode })}>{formattedDate}</span>}
            </CalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </>
  );
}

/** A month to pick a day or a range in; it opens on the value's month. */
function Calendar({ min, max, autoFocus, locale = 'en-US', className, ...props }: CalendarProps) {
  const shared = {
    'data-slot': 'calendar',
    minValue: toDate(min),
    maxValue: toDate(max),
    autoFocus,
    className: cn('w-fit p-3 [--cell-size:2.25rem]', className),
  };
  return (
    <I18nProvider locale={locale}>
      {props.mode === 'range' ? (
        <AriaRangeCalendar
          {...shared}
          value={props.value && { start: parseDate(props.value.start), end: parseDate(props.value.end) }}
          onChange={(range) => props.onValueChange({ start: range.start.toString(), end: range.end.toString() })}>
          <CalendarMonth mode='range' />
        </AriaRangeCalendar>
      ) : (
        <AriaCalendar {...shared} value={toDate(props.value)} onChange={(date) => props.onValueChange(date.toString())}>
          <CalendarMonth mode='single' />
        </AriaCalendar>
      )}
    </I18nProvider>
  );
}

export { Calendar, type DateRange };
