import { type CalendarDate, parseDate } from '@internationalized/date';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';

import { Calendar } from '~/components/ui/calendar';
import {
  DateField,
  SegmentsInput,
  focusFirstSegment,
  segmentedFieldClassName,
  useFieldLabel,
} from '~/components/ui/datefield-rac';
import { InputGroupButton } from '~/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

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
        className={cn(segmentedFieldClassName, className)}>
        {({ state }) => {
          const showPlaceholder =
            placeholder !== undefined &&
            state.segments.every((segment) => !segment.isEditable || segment.isPlaceholder);
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

export { DateInput };
