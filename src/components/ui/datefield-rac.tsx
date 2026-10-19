import * as React from 'react';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';
import {
  DateFieldProps,
  DateField as DateFieldRac,
  DateInputProps as DateInputPropsRac,
  DateInput as DateInputRac,
  DateSegmentProps,
  DateSegment as DateSegmentRac,
  DateValue as DateValueRac,
} from 'react-aria-components/DateField';
import { TimeFieldProps, TimeField as TimeFieldRac, TimeValue as TimeValueRac } from 'react-aria-components/TimeField';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

/**
 * The field surface of a segmented date or time field: `Input` height and padding, the end addon (calendar button or
 * clock) 8px in like an `InputGroupButton` `icon-xs`, so both icons sit on the same spot.
 */
const segmentedFieldClassName = cn(
  inputSurfaceVariants({ scope: 'within' }),
  'flex h-10 w-full min-w-0 cursor-text items-center pr-[7px] pl-3.5 text-control',
  'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-field-flat',
);

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

function DateField<T extends DateValueRac>({
  className,
  children,
  ...props
}: DateFieldProps<T> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <DateFieldRac
      data-slot='date-field'
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}>
      {children}
    </DateFieldRac>
  );
}

function TimeField<T extends TimeValueRac>({
  className,
  children,
  ...props
}: TimeFieldProps<T> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <TimeFieldRac
      data-slot='time-field'
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}>
      {children}
    </TimeFieldRac>
  );
}

// The focused segment takes the brand fill, like the selected day in the calendar; literals (`.`, `:`) stay muted.
function DateSegment({ className, ...props }: DateSegmentProps) {
  return (
    <DateSegmentRac
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
      {...props}
    />
  );
}

interface DateInputProps extends DateInputPropsRac {
  className?: string;
}

/** Segments render 16px on coarse pointers, so iOS does not zoom on focus. */
function DateInput({ className, ...props }: Omit<DateInputProps, 'children'>) {
  return (
    <DateInputRac
      className={composeRenderProps(className, (className) =>
        cn('flex min-w-0 flex-1 items-center pointer-coarse:text-[1rem]', className),
      )}
      {...props}>
      {(segment) => <DateSegment segment={segment} />}
    </DateInputRac>
  );
}

export { DateField, DateInput, DateSegment, TimeField, focusFirstSegment, segmentedFieldClassName, useFieldLabel };
export type { DateInputProps };
