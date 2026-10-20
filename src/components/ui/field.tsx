import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';

import { useUiConfig } from '~/lib/ui-config';
import { cn } from '~/lib/utils';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot='field-set'
      className={cn('flex flex-col gap-group has-[>[data-slot=radio-group]]:gap-related', className)}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot='field-legend'
      data-variant={variant}
      className={cn(
        'mb-group',
        'data-[variant=legend]:text-heading',
        'data-[variant=label]:text-body data-[variant=label]:font-medium',
        className,
      )}
      {...props}
    />
  );
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

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role='group'
      data-slot='field'
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-content'
      className={cn('group/field-content flex flex-1 flex-col gap-tight leading-snug', className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot='field-label'
      className={cn(
        // No `leading-snug`: Label's `leading-none` keeps the label→control gap tight.
        'group/field-label peer/field-label flex w-fit gap-2 group-data-[disabled=true]/field:text-disabled-foreground',
        className,
      )}
      {...props}
    />
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
        // A description that follows a label or legend sits `tight` below it: pull back the parent's larger gap.
        'last:mt-0 nth-last-2:-mt-[calc(var(--spacing-related)-var(--spacing-tight))] [[data-variant=legend]+&]:-mt-[calc(var(--spacing-group)-var(--spacing-tight))]',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  );
}

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
          className='relative mx-auto block w-fit bg-background px-2 text-muted-foreground'
          data-slot='field-separator-content'>
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  /** Messages go through `UiConfig.message`: an app with i18n passes keys and translates them there. */
  errors?: Array<{ message?: string } | undefined>;
}) {
  const t = useUiConfig().message;
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
          t(messages[0])
        ) : (
          <ul className='ml-4 flex list-disc flex-col gap-tight'>
            {messages.map((message) => (
              <li key={message}>{t(message)}</li>
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
