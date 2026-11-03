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
 * the rest. One inset (`--alert-pad`) on every side, around the text and around an `AlertAction` alike, which stays at
 * the far edge, concentric with the corner. The text wraps at a readable measure (`max-w-prose`, no orphaned last
 * word). The root reads its parts (`has-data-[slot=…]`), so the layout needs no props.
 */
function Alert({ className, intent = 'info', ...props }: AlertProps) {
  return (
    <div
      data-slot='alert'
      data-intent={intent}
      className={cn(
        intentVariants({ intent, emphasis: 'subtle' }),
        'group/alert flex w-full items-center gap-(--alert-pad) rounded-(--alert-radius) p-(--alert-pad) text-body data-[intent=neutral]:text-muted-foreground',
        '[--outer-inset:var(--alert-pad)] [--outer-radius:var(--alert-radius)]',
        'max-sm:has-data-[slot=alert-action]:flex-col max-sm:has-data-[slot=alert-action]:items-start',
        className,
      )}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='alert-content' className={cn('min-w-0 flex-1 max-w-prose text-pretty', className)} {...props} />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-action'
      className={cn('shrink-0 sm:ml-auto [&>:is(button,a)]:rounded-inner', className)}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertAction };
