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
        'group/alert flex w-full items-center gap-part rounded-(--alert-radius) px-(--alert-pad-x) py-(--alert-pad-y) text-body data-[intent=neutral]:text-muted-foreground',
        '[--outer-inset:var(--alert-action-inset)] [--outer-radius:var(--alert-radius)]',
        'has-data-[slot=alert-action]:py-(--alert-action-inset) sm:has-data-[slot=alert-action]:pr-(--alert-action-inset)',
        'max-sm:has-data-[slot=alert-action]:flex-col max-sm:has-data-[slot=alert-action]:items-start max-sm:has-data-[slot=alert-action]:gap-(--alert-pad-y) max-sm:has-data-[slot=alert-action]:py-part',
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
