import type * as React from 'react';

import { type Intent, intentVariants } from '~/components/ui/intent-variants';

import { cn } from '~/lib/utils';

/**
 * A notice inside a page: an `intent` at `subtle` emphasis, always. The parts set `data-slot`, so the root adjusts its
 * insets with `has-data-[slot=…]` instead of props.
 *
 * Text only: no icon. The intent says what kind of notice it is; the first line says the rest. Text starts 20px in
 * (`px-5`), the edge of `InsetCard` header text and section titles. Title and body lines sit flush: the line height is
 * the gap.
 *
 * Shape: the card radius (`rounded-card`). The action sits 6px in on every side (`py-1.5`, `pr-1.5`) and takes
 * `rounded-inner`, so it stays concentric with the callout.
 */
const calloutShape = [
  'group/callout flex w-full items-center gap-3 rounded-card px-5 py-2.5 text-body data-[intent=neutral]:text-muted-foreground',
  '[--outer-inset:--spacing(1.5)] [--outer-radius:var(--radius-card)]',
  'has-data-[slot=callout-action]:py-1.5 sm:has-data-[slot=callout-action]:pr-1.5',
  'max-sm:has-data-[slot=callout-action]:flex-col max-sm:has-data-[slot=callout-action]:items-start max-sm:has-data-[slot=callout-action]:gap-2.5 max-sm:has-data-[slot=callout-action]:py-3',
];

type CalloutIntent = Exclude<Intent, 'primary'>;

/** The names before `intent`. Kept until the app migrates. */
const TONES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  neutral: 'neutral',
  /** @deprecated Omit `intent` (info). */
  default: 'info',
} as const satisfies Record<string, CalloutIntent>;

type CalloutProps = React.ComponentProps<'div'> & {
  /** What kind of notice: `info` (the default; a plain notice reads as information, not as a gray block), `success`,
   * `warning`, `destructive`, or `neutral` for an aside that is not news. */
  intent?: CalloutIntent;
  /** @deprecated Use `intent`. */
  tone?: keyof typeof TONES;
};

function Callout({ className, intent, tone, ...props }: CalloutProps) {
  const resolved = intent ?? TONES[tone ?? 'info'];
  return (
    <div
      data-slot='callout'
      data-intent={resolved}
      className={cn(intentVariants({ intent: resolved, emphasis: 'subtle' }), calloutShape, className)}
      {...props}
    />
  );
}

function CalloutContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='callout-content' className={cn('min-w-0 flex-1', className)} {...props} />;
}

function CalloutAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='callout-action'
      className={cn('shrink-0 sm:[&>:is(button,a)]:rounded-inner', className)}
      {...props}
    />
  );
}

export { Callout, CalloutContent, CalloutAction };
