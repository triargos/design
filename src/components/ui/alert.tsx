import type * as React from 'react';

import { type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

/**
 * A notice inside a page: an `intent` at `subtle` emphasis, always. The parts set `data-slot`, so the root adjusts its
 * insets with `has-data-[slot=…]` instead of props.
 *
 * Text only: no icon. The intent says what kind of notice it is; the first line says the rest. Text starts 20px in
 * (`px-5`), the edge of `Card` header text and section titles. Title and body lines sit flush: the line height is
 * the gap.
 *
 * Shape: the card radius (`rounded-card`). The action sits 6px in on every side (`py-1.5`, `pr-1.5`) and takes
 * `rounded-inner`, so it stays concentric with the alert.
 */

type AlertProps = React.ComponentProps<'div'> & {
  /** What kind of notice: `info` (the default; a plain notice reads as information, not as a gray block), `success`,
   * `warning`, `destructive`, or `neutral` for an aside that is not news. */
  intent?: Exclude<Intent, 'primary'>;
};

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
