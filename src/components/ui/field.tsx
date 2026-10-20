import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { Separator } from '~/components/ui/separator';

import { cn } from '~/lib/utils';

/** Several fields that answer one question (a checkbox or radio list), named by a `FieldLegend`. */
function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot='field-set'
      className={cn('flex flex-col gap-group has-[>[data-slot=radio-group]]:gap-related', className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: React.ComponentProps<'legend'>) {
  return <legend data-slot='field-legend' className={cn('mb-group text-body font-medium', className)} {...props} />;
}

const fieldGroupVariants = cva('group/field-group @container/field-group flex w-full flex-col gap-group', {
  variants: {
    columns: {
      1: '',
      // Same gap as one column, both axes: the fields are peers whichever way they wrap.
      2: 'grid md:grid-cols-2',
    },
  },
  defaultVariants: { columns: 1 },
});

function FieldGroup({
  className,
  columns,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldGroupVariants>) {
  return <div data-slot='field-group' className={cn(fieldGroupVariants({ columns }), className)} {...props} />;
}

const fieldVariants = cva('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      // `related`, not 12px: a field has no solid border, so the eye adds its inner top space to the label gap.
      vertical: ['flex-col gap-related [&>*]:w-full [&>.sr-only]:w-auto'],
      horizontal: [
        'flex-row items-center',
        '[&>[data-slot=field-label]]:flex-auto',
        'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        // A checkbox or radio sits on the label's first line; a switch centers on label + description.
        '[&>[data-slot=switch]]:self-center',
      ],
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

/**
 * A label, a control, a description and an error, in that order. `invalid` and `disabled` style the label and text;
 * the control takes its own `aria-invalid` and `disabled`.
 */
function Field({
  className,
  orientation = 'vertical',
  invalid,
  disabled,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants> & { invalid?: boolean; disabled?: boolean }) {
  return (
    <div
      role='group'
      data-slot='field'
      data-orientation={orientation}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

/** The label and description beside a checkbox, radio or switch. */
function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-content'
      className={cn('group/field-content flex flex-1 flex-col gap-tight leading-snug', className)}
      {...props}
    />
  );
}

/** `required` adds an asterisk; the control still takes `required` itself. */
function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<'label'> & { required?: boolean }) {
  return (
    <label
      data-slot='field-label'
      className={cn(
        // `leading-none` keeps the label→control gap tight.
        'group/field-label peer/field-label flex w-fit items-center gap-2 text-body leading-none font-medium select-none',
        'group-data-[disabled=true]/field:text-disabled-foreground peer-disabled:cursor-not-allowed peer-disabled:text-disabled-foreground',
        className,
      )}
      {...props}>
      {children}
      {required && (
        <span aria-hidden className='-ml-1 text-caption text-muted-foreground'>
          *
        </span>
      )}
    </label>
  );
}

/** A `FieldLabel` for a control that is not an input: name it with `id` and the control's `aria-labelledby`. */
function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-label'
      className={cn(
        'flex w-fit items-center gap-2 text-body font-medium group-data-[disabled=true]/field:text-disabled-foreground',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='field-description'
      className={cn(
        'text-body font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance',
        // A description that follows a label sits `tight` below it: pull back the field's larger gap.
        'last:mt-0 nth-last-2:-mt-[calc(var(--spacing-related)-var(--spacing-tight))]',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  );
}

/** A divider between fields; with children, a labelled one ("or"). */
function FieldSeparator({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-separator'
      data-content={!!children}
      className={cn('relative -my-2 h-5 text-body', className)}
      {...props}>
      <Separator className='absolute inset-0 top-1/2' />
      {children && (
        <span
          className='relative mx-auto block w-fit bg-surface px-2 text-muted-foreground'
          data-slot='field-separator-content'>
          {children}
        </span>
      )}
    </div>
  );
}

/**
 * The field's error: `children`, or the messages in `errors` (react-hook-form's `fieldState.error` fits), deduped;
 * several render as a list. Renders nothing without one, so it can stay in the tree.
 */
function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const messages = [
    ...new Set(errors?.map((error) => error?.message).filter((message): message is string => !!message)),
  ];
  if (!children && messages.length === 0) return null;

  return (
    <div
      role='alert'
      data-slot='field-error'
      className={cn('text-body font-normal text-destructive', className)}
      {...props}>
      {children ||
        (messages.length === 1 ? (
          messages[0]
        ) : (
          <ul className='ml-4 flex list-disc flex-col gap-tight'>
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ))}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
