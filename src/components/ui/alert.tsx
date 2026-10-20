import type * as React from 'react';

import { type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

type AlertProps = React.ComponentProps<'div'> & {
  /** What kind of notice: `info` (the default; a plain notice reads as information, not as a gray block), `success`,
   * `warning`, `destructive`, or `neutral` for an aside that is not news. */
  intent?: Exclude<Intent, 'primary'>;
};

/**
 * A notice inside a page, always `subtle`. Text only: the intent says what kind of notice it is, the first line says
 * the rest. Its text shares the edge of `Card` header text, and an `AlertAction` stays concentric with its corner. The
 * root reads its parts (`has-data-[slot=…]`), so the layout needs no props.
 */
function Alert({ className, intent = 'info', ...props }: AlertProps) {
  return (
    <div
      data-slot='alert'
      data-intent={intent}
      className={cn(
        intentVariants({ intent, emphasis: 'subtle' }),
        'group/alert flex w-full items-center gap-3 rounded-card px-5 py-2.5 text-body data-[intent=neutral]:text-muted-foreground',
        '[--outer-inset:--spacing(1.5)] [--outer-radius:var(--radius-card)]',
        'has-data-[slot=alert-action]:py-1.5 sm:has-data-[slot=alert-action]:pr-1.5',
        'max-sm:has-data-[slot=alert-action]:flex-col max-sm:has-data-[slot=alert-action]:items-start max-sm:has-data-[slot=alert-action]:gap-2.5 max-sm:has-data-[slot=alert-action]:py-3',
        className,
      )}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='alert-content' className={cn('min-w-0 flex-1', className)} {...props} />;
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='alert-action' className={cn('shrink-0 sm:[&>:is(button,a)]:rounded-inner', className)} {...props} />
  );
}

export { Alert, AlertContent, AlertAction };
