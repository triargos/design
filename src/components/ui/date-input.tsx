import { type CalendarDate, Time, parseDate, parseTime } from '@internationalized/date';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import * as React from 'react';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';
import {
  type DateFieldProps,
  DateField as AriaDateField,
  type DateInputProps as AriaDateInputProps,
  DateInput as AriaDateInput,
  type DateSegmentProps,
  DateSegment as AriaDateSegment,
  type DateValue as AriaDateValue,
} from 'react-aria-components/DateField';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import {
  type TimeFieldProps,
  TimeField as AriaTimeField,
  type TimeValue as AriaTimeValue,
} from 'react-aria-components/TimeField';

import { Calendar } from '~/components/ui/calendar';
import { inputSurfaceVariants } from '~/components/ui/input';
import { InputGroupButton } from '~/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

// DateInput and TimeInput share one segmented field (react-aria's DateField/TimeField): the parts below are internal.

/** A click on the field's padding or its decorative icon focuses the first segment. */
const focusFirstSegment = (event: React.MouseEvent<HTMLElement>) => {
  if ((event.target as HTMLElement).closest('[role=spinbutton],button')) return;
  const segment = event.currentTarget.querySelector<HTMLElement>('[role=spinbutton]:not([aria-disabled=true])');
  if (!segment) return;
  event.preventDefault();
  segment.focus();
};

/**
 * `FieldLabel htmlFor={id}` only names and focuses a native input. A segmented field is a group of spinbuttons, so this
 * finds the label, returns its id for `aria-labelledby`, and focuses the first segment when the label is clicked.
 */
function useFieldLabel(id: string | undefined, fieldRef: React.RefObject<HTMLElement | null>): string | undefined {
  const [labelId, setLabelId] = React.useState<string>();
  React.useEffect(() => {
    if (!id) return;
    const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
    if (!label) return;
    label.id ||= `${id}-label`;
    setLabelId(label.id);
    const focus = () => fieldRef.current?.querySelector<HTMLElement>('[role=spinbutton]')?.focus();
    label.addEventListener('click', focus);
    return () => label.removeEventListener('click', focus);
  }, [id, fieldRef]);
  return labelId;
}

/**
 * The field surface of a segmented date or time field: `Input` height and padding, the end addon (calendar button or
 * clock) 6px in like an `InputGroupButton` `icon-xs`, so both icons sit on the same spot.
 */
function DateField<T extends AriaDateValue>({
  className,
  ...props
}: Omit<DateFieldProps<T>, 'className'> & { className?: string; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <AriaDateField
      data-slot='date-field'
      className={cn(
        inputSurfaceVariants({ scope: 'within' }),
        'flex h-9 w-full min-w-0 cursor-text items-center pr-[5px] pl-[calc(--spacing(3)-1px)] text-control',
        'data-disabled:cursor-not-allowed data-disabled:opacity-64 data-disabled:shadow-field-flat data-disabled:before:shadow-none',
        className,
      )}
      {...props}
    />
  );
}

/** The same field surface as `DateField`. */
function TimeField<T extends AriaTimeValue>({
  className,
  ...props
}: Omit<TimeFieldProps<T>, 'className'> & { className?: string; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <AriaTimeField
      data-slot='time-field'
      className={cn(
        inputSurfaceVariants({ scope: 'within' }),
        'flex h-9 w-full min-w-0 cursor-text items-center pr-[5px] pl-[calc(--spacing(3)-1px)] text-control',
        'data-disabled:cursor-not-allowed data-disabled:opacity-64 data-disabled:shadow-field-flat data-disabled:before:shadow-none',
        className,
      )}
      {...props}
    />
  );
}

// The focused segment takes the brand fill, like the selected day in the calendar; literals (`.`, `:`) stay muted.
function DateSegment({ className, ...props }: DateSegmentProps) {
  return (
    <AriaDateSegment
      className={composeRenderProps(className, (className) =>
        cn(
          'inline rounded-control-xs px-px text-foreground caret-transparent outline-hidden',
          'data-placeholder:text-faint-foreground',
          'data-focused:bg-primary-solid data-focused:text-primary-solid-foreground data-focused:data-placeholder:text-primary-solid-foreground',
          'data-invalid:text-destructive data-invalid:data-placeholder:text-destructive',
          'data-invalid:data-focused:bg-destructive-solid data-invalid:data-focused:text-destructive-solid-foreground data-invalid:data-focused:data-placeholder:text-destructive-solid-foreground',
          'data-disabled:cursor-not-allowed data-disabled:text-disabled-foreground',
          'data-[type=literal]:px-0 data-[type=literal]:text-muted-foreground',
          className,
        ),
      )}
      {...props}>
      {/* Node's ICU puts a narrow no-break space before AM/PM, browsers a plain one: one text for server and client. */}
      {props.segment.type === 'literal' ? props.segment.text.replace(/\u202f/g, ' ') : undefined}
    </AriaDateSegment>
  );
}

/** The segments of a `DateField` or `TimeField`. They render 16px below `sm`, so iOS does not zoom on focus. */
function SegmentsInput({ className, ...props }: Omit<AriaDateInputProps, 'children'>) {
  return (
    <AriaDateInput
      className={composeRenderProps(className, (className) =>
        cn('flex min-w-0 flex-1 items-center max-sm:text-[1rem]', className),
      )}
      {...props}>
      {(segment) => <DateSegment segment={segment} />}
    </AriaDateInput>
  );
}

/**
 * `ref` focuses the first segment (a form library's `field.ref`). `aria-invalid` turns the segments `destructive`.
 * `placeholder` replaces the empty segments until the field takes focus.
 */
interface DateInputProps {
  /** `YYYY-MM-DD`, or `''` when empty. */
  value: string;
  onValueChange: (value: string) => void;
  /** Calendar bounds, `YYYY-MM-DD`. A typed date outside them is still reported: validation owns the rule. */
  min?: string;
  max?: string;
  /** BCP 47; sets the segment order (MM/DD/YYYY in en-US) and the calendar's names. */
  locale?: string;
  chooseDateLabel?: string;
  ref?: React.Ref<{ focus: () => void }>;
  id?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

const toCalendarDate = (value: string): CalendarDate | null => (value ? parseDate(value) : null);

/** A date typed into segments in the locale's order; the button at the end opens the calendar (or Alt+↓). */
function DateInput({
  value,
  onValueChange,
  min,
  max,
  locale = 'en-US',
  chooseDateLabel = 'Choose date',
  placeholder,
  disabled,
  className,
  onBlur,
  ref,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: DateInputProps) {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const labelId = useFieldLabel(id, fieldRef);
  const [open, setOpen] = React.useState(false);
  // The segments hold what is typed; the value only changes once the year has four digits, since typing `2026`
  // passes through the years 2, 20 and 202. A new `value` from outside replaces the draft.
  const [draft, setDraft] = React.useState<CalendarDate | null>(() => toCalendarDate(value));
  const [draftOf, setDraftOf] = React.useState(value);
  if (value !== draftOf) {
    setDraftOf(value);
    if ((draft?.toString() ?? '') !== value) setDraft(toCalendarDate(value));
  }

  React.useImperativeHandle(
    ref,
    () => ({ focus: () => fieldRef.current?.querySelector<HTMLElement>('[role=spinbutton]')?.focus() }),
    [],
  );

  return (
    <I18nProvider locale={locale}>
      <DateField
        ref={fieldRef}
        id={id}
        name={name}
        value={draft}
        onChange={(next) => {
          setDraft(next);
          // Every complete date is reported, in range or not: validation has to see an out-of-range date to reject it.
          if (next === null) onValueChange('');
          else if (next.year >= 1000) onValueChange(next.toString());
        }}
        onBlur={() => {
          setDraft(toCalendarDate(value));
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && e.altKey) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        isDisabled={disabled}
        isInvalid={ariaInvalid === true || ariaInvalid === 'true'}
        validationBehavior='aria'
        shouldForceLeadingZeros
        aria-label={ariaLabel}
        aria-labelledby={labelId}
        aria-describedby={ariaDescribedBy}
        onMouseDown={focusFirstSegment}
        className={className}>
        {({ state }) => {
          const showPlaceholder =
            placeholder !== undefined &&
            state.segments.every((segment) => !segment.isEditable || segment.isPlaceholder);
          return (
            <>
              <span className='relative flex min-w-0 flex-1 items-center'>
                <SegmentsInput className={cn('peer', showPlaceholder && 'opacity-0 focus-within:opacity-100')} />
                {showPlaceholder && (
                  <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-faint-foreground peer-focus-within:hidden max-sm:text-[1rem]'>
                    {placeholder}
                  </span>
                )}
              </span>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={<InputGroupButton size='icon-xs' disabled={disabled} aria-label={chooseDateLabel} />}>
                  <CalendarIcon />
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='end' sideOffset={8}>
                  {/* Mounts with the popover, so it opens on the value's month. */}
                  <Calendar
                    value={value}
                    min={min}
                    max={max}
                    locale={locale}
                    autoFocus
                    onValueChange={(date) => {
                      onValueChange(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </>
          );
        }}
      </DateField>
    </I18nProvider>
  );
}

interface TimeInputProps {
  /** `HH:mm` (24-hour), or `''` when empty. */
  value: string;
  onValueChange: (value: string) => void;
  /** BCP 47; sets the hour cycle shown (a 12-hour clock with AM/PM in en-US). The value stays 24-hour. */
  locale?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
}

const pad = (n: number): string => String(n).padStart(2, '0');

const toTimeValue = (value: string): Time | null => (/^\d{2}:\d{2}$/.test(value) ? parseTime(value) : null);

/** A time of day typed into segments, at `Input` height; the clock sits where `DateInput` has its calendar button. */
function TimeInput({
  value,
  onValueChange,
  locale = 'en-US',
  disabled,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: TimeInputProps) {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const labelId = useFieldLabel(id, fieldRef);

  return (
    <I18nProvider locale={locale}>
      <TimeField
        ref={fieldRef}
        id={id}
        name={name}
        value={toTimeValue(value)}
        onChange={(time) => onValueChange(time ? `${pad(time.hour)}:${pad(time.minute)}` : '')}
        isDisabled={disabled}
        isInvalid={ariaInvalid}
        validationBehavior='aria'
        shouldForceLeadingZeros
        aria-label={ariaLabel}
        aria-labelledby={labelId}
        onMouseDown={focusFirstSegment}
        className={className}>
        <SegmentsInput />
        <span
          aria-hidden
          className='flex size-6 shrink-0 items-center justify-center text-muted-foreground in-data-disabled:text-disabled-foreground [&_svg]:size-4'>
          <ClockIcon />
        </span>
      </TimeField>
    </I18nProvider>
  );
}

export { DateInput, TimeInput };
