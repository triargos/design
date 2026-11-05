import * as React from 'react';

import { ButtonDefaults } from '~/components/ui/button';

import { type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

type AlertProps = React.ComponentProps<'div'> & {
  /** What kind of notice: `info` (the default; a plain notice reads as information, not as a gray block), `success`,
   * `warning`, `destructive`, or `neutral` for an aside that is not news. */
  intent?: Exclude<Intent, 'primary'>;
};

/**
 * A notice inside a page, always `subtle`. Text only: the intent says what kind of notice it is, the first line says
 * the rest. One inset (`--alert-pad`) on every side; the text adds `tight` and trims its leading to the cap height and
 * the baseline, so it sits optically centered and level with an action. Stacked on a phone, the action lines up with
 * the text, not the box. The corner stays below a card content corner,
 * as a field's does. The text wraps at a readable measure (`max-w-prose`, no orphaned last word). The root reads its
 * parts (`has-data-[slot=…]`), so the layout needs no props.
 */
const AlertIntentContext = React.createContext<NonNullable<AlertProps['intent']>>('info');

function Alert({ className, intent = 'info', ...props }: AlertProps) {
  return (
    <AlertIntentContext value={intent}>
      <div
        data-slot='alert'
        data-intent={intent}
        className={cn(
          intentVariants({ intent, emphasis: 'subtle' }),
          'group/alert flex w-full items-center gap-(--alert-pad) rounded-(--alert-radius) p-(--alert-pad) text-body data-[intent=neutral]:text-muted-foreground',
          'max-sm:has-data-[slot=alert-action]:flex-col max-sm:has-data-[slot=alert-action]:items-start',
          className,
        )}
        {...props}
      />
    </AlertIntentContext>
  );
}

function AlertContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-content'
      className={cn('min-w-0 flex-1 max-w-prose p-tight text-pretty [text-box:trim-both_cap_alphabetic]', className)}
      {...props}
    />
  );
}

/** Its buttons take the alert's intent, solid, at `sm`, unless they pass their own. */
function AlertAction({ className, children, ...props }: React.ComponentProps<'div'>) {
  const intent = React.use(AlertIntentContext);
  return (
    <div data-slot='alert-action' className={cn('shrink-0 max-sm:ms-tight sm:ms-auto', className)} {...props}>
      <ButtonDefaults intent={intent} emphasis='solid' size='sm'>
        {children}
      </ButtonDefaults>
    </div>
  );
}

export { Alert, AlertContent, AlertAction };
