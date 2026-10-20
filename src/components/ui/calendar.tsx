import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';
import { de } from 'react-day-picker/locale';

import { buttonVariants } from '~/components/ui/button';
import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

const defaultClassNames = getDefaultClassNames();

const navButtonClassName = cn(
  buttonVariants({ intent: 'neutral', emphasis: 'ghost' }),
  'h-(--cell-size) w-(--cell-size) rounded-control p-0 select-none hover:bg-foreground/6 aria-disabled:text-disabled-foreground dark:hover:bg-foreground/6',
);

const chevronIcons = { left: ChevronLeftIcon, right: ChevronRightIcon, up: ChevronDownIcon, down: ChevronDownIcon };

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={de}
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-background p-3 [--cell-size:2.25rem] in-data-[slot=inset-card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(de.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1', defaultClassNames.nav),
        button_previous: cn(navButtonClassName, defaultClassNames.button_previous),
        button_next: cn(navButtonClassName, defaultClassNames.button_next),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-body font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          inputSurfaceVariants({ scope: 'within' }),
          'relative rounded-control',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'text-body font-medium select-none',
          captionLayout !== 'label' &&
            'flex h-8 items-center gap-1 rounded-control pr-1.5 pl-2.5 [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label,
        ),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn('flex-1 text-caption font-normal text-muted-foreground select-none', defaultClassNames.weekday),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-(--cell-size) select-none', defaultClassNames.week_number_header),
        week_number: cn('text-caption text-muted-foreground select-none', defaultClassNames.week_number),
        day: cn(
          'group/day relative aspect-square h-full w-full p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-control [&:last-child[data-selected=true]_button]:rounded-r-control',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-control bg-foreground/6', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-control bg-foreground/6', defaultClassNames.range_end),
        today: cn('rounded-control bg-foreground/6 font-medium text-foreground', defaultClassNames.today),
        outside: cn('text-muted-foreground aria-selected:text-muted-foreground', defaultClassNames.outside),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ rootRef, ...props }) => <div data-slot='calendar' ref={rootRef} {...props} />,
        Chevron: ({ className, orientation = 'down', ...props }) => {
          const Icon = chevronIcons[orientation];
          return <Icon className={cn('size-4', className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className='flex size-(--cell-size) items-center justify-center text-center'>{children}</div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // A plain <button>: Button's ghost variant brings `bg-muted` hover/open states and a dark-mode hover
  // that would override the selected fill.
  return (
    <button
      ref={ref}
      type='button'
      data-day={day.date.toLocaleDateString(de.code)}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'relative flex aspect-square h-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-1 rounded-control text-body leading-none font-normal transition-colors outline-none select-none',
        'hover:bg-foreground/6 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-foreground/15 disabled:pointer-events-none',
        'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-foreground/6',
        'data-[range-end=true]:bg-primary-solid data-[range-end=true]:text-primary-solid-foreground data-[range-start=true]:bg-primary-solid data-[range-start=true]:text-primary-solid-foreground data-[selected-single=true]:bg-primary-solid data-[selected-single=true]:text-primary-solid-foreground',
        '[&>span]:text-caption [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar };
