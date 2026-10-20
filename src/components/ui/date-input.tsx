import { CalendarDate, parseDate } from '@internationalized/date';
import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '~/components/ui/calendar';
import {
  DateField,
  SegmentsInput,
  focusFirstSegment,
  segmentedFieldClassName,
  useFieldLabel,
} from '~/components/ui/datefield-rac';
import { InputGroupButton } from '~/components/ui/input-group';
import { PickerTrigger } from '~/components/ui/picker-trigger';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

import { IsoDate, IsoDateRange } from '~/lib/iso-date';
import { useUiStrings } from '~/lib/ui-config';
import { cn } from '~/lib/utils';

interface DateValueProps {
  value: IsoDate | null;
  onChange: (value: IsoDate | null) => void;
  /** Calendar bounds only — the form schema owns the range rule, see `IsoDateRange.filter`. */
  min?: IsoDate;
  max?: IsoDate;
}

/**
 * `ref` focuses the first segment (react-hook-form's `field.ref`). `aria-invalid` turns the segments `destructive`.
 * `placeholder` replaces the empty segments until the field takes focus.
 */
interface TypeableProps extends DateValueProps {
  variant?: 'input';
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

type DateInputProps =
  | TypeableProps
  | (DateValueProps &
      Omit<React.ComponentProps<'button'>, keyof DateValueProps | 'size' | 'type'> & {
        variant: 'card';
        label?: string;
        startIcon?: React.ReactNode;
        placeholder?: string;
      });

type CardProps = Extract<DateInputProps, { variant: 'card' }>;

const rangeOf = (min: IsoDate | undefined, max: IsoDate | undefined): IsoDateRange => {
  const sanity = IsoDateRange.default();
  return { min: min ?? sanity.min, max: max ?? sanity.max };
};

const toCalendarDate = (value: IsoDate | null): CalendarDate | null => (value ? parseDate(value) : null);

export function DateInput(props: DateInputProps) {
  return props.variant === 'card' ? <DateInputCard {...props} /> : <DateInputTypeable {...props} />;
}

/**
 * The popup calendar of both variants. It mounts with the popover, so it opens on the value's month; days outside
 * `min`/`max` are disabled.
 */
function DateCalendar({
  value,
  min,
  max,
  onSelect,
}: Omit<DateValueProps, 'onChange'> & { onSelect: (value: IsoDate | null) => void }) {
  const inRange = IsoDateRange.contains(rangeOf(min, max));
  const selected = value ? IsoDate.toDate(value) : undefined;
  return (
    <Calendar
      mode='single'
      selected={selected}
      defaultMonth={selected}
      onSelect={(date) => onSelect(date ? IsoDate.fromDate(date) : null)}
      disabled={(date) => !inRange(IsoDate.fromDate(date))}
      autoFocus
    />
  );
}

function DateInputCard({
  value,
  onChange,
  min,
  max,
  placeholder,
  disabled,
  className,
  label,
  startIcon,
  variant: _variant,
  ...rest
}: CardProps) {
  const strings = useUiStrings();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <PickerTrigger
            disabled={disabled}
            data-empty={!value}
            className={cn('h-auto gap-3 py-3', className)}
            {...rest}
          />
        }>
        <span className='text-muted-foreground [&_svg]:size-4'>{startIcon ?? <CalendarIcon />}</span>
        <span className='flex flex-col items-start gap-0.5 text-left'>
          {label && <span className='text-caption text-muted-foreground'>{label}</span>}
          <span className={cn('text-control font-medium', !value && 'font-normal text-muted-foreground')}>
            {value ? format(IsoDate.toDate(value), 'EEE, d. MMM', { locale: de }) : (placeholder ?? strings.emptyValue)}
          </span>
        </span>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <DateCalendar
          value={value}
          min={min}
          max={max}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function DateInputTypeable({
  value,
  onChange,
  min,
  max,
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
}: TypeableProps) {
  const strings = useUiStrings();
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const labelId = useFieldLabel(id, fieldRef);
  const [open, setOpen] = React.useState(false);
  // The segments hold what is typed; the form only sees it once the year has four digits, since typing `2026`
  // passes through the years 2, 20 and 202. A new `value` from outside replaces the draft.
  const [draft, setDraft] = React.useState<CalendarDate | null>(() => toCalendarDate(value));
  const [draftOf, setDraftOf] = React.useState(value);
  if (value !== draftOf) {
    setDraftOf(value);
    if (draft?.toString() !== value) setDraft(toCalendarDate(value));
  }

  React.useImperativeHandle(
    ref,
    () => ({ focus: () => fieldRef.current?.querySelector<HTMLElement>('[role=spinbutton]')?.focus() }),
    [],
  );

  return (
    <DateField
      ref={fieldRef}
      id={id}
      name={name}
      value={draft}
      onChange={(next) => {
        setDraft(next);
        // Every complete date is emitted, in range or not: the form schema has to see an out-of-range date to
        // report it.
        if (next === null) onChange(null);
        else if (next.year >= 1000) onChange(IsoDate.make(next.toString()));
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
      className={cn(segmentedFieldClassName, className)}>
      {({ state }) => {
        const showPlaceholder =
          placeholder !== undefined && state.segments.every((segment) => !segment.isEditable || segment.isPlaceholder);
        return (
          <>
            <span className='relative flex min-w-0 flex-1 items-center'>
              <SegmentsInput className={cn('peer', showPlaceholder && 'opacity-0 focus-within:opacity-100')} />
              {showPlaceholder && (
                <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-faint-foreground peer-focus-within:hidden pointer-coarse:text-[1rem]'>
                  {placeholder}
                </span>
              )}
            </span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={<InputGroupButton size='icon-xs' disabled={disabled} aria-label={strings.chooseDate} />}>
                <CalendarIcon />
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='end' sideOffset={8}>
                <DateCalendar
                  value={value}
                  min={min}
                  max={max}
                  onSelect={(date) => {
                    onChange(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </>
        );
      }}
    </DateField>
  );
}
