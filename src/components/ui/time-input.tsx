import { Time, parseTime } from '@internationalized/date';
import { ClockIcon } from 'lucide-react';
import * as React from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';

import {
  SegmentsInput,
  TimeField,
  focusFirstSegment,
  segmentedFieldClassName,
  useFieldLabel,
} from '~/components/ui/datefield-rac';

import { cn } from '~/lib/utils';

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
        className={cn(segmentedFieldClassName, className)}>
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

export { TimeInput };
