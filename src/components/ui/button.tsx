import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { AnimatePresence, motion, type Transition, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { type Emphasis, type Intent, intentVariants } from '~/components/ui/intent-variants';
import { Loader } from '~/components/ui/loader';

import { cn } from '~/lib/utils';

/**
 * A button is an `intent` (what the action means) at an `emphasis` (how much it weighs): `primary`/`solid` is the one
 * main action, `neutral`/`raised` every other, `neutral`/`ghost` header, row and toolbar actions, `destructive`/`solid`
 * an irreversible action inside a confirmation and every danger-zone action, `destructive`/`subtle` a destructive action
 * anywhere else. A button that
 * looks like a field is `PickerTrigger`; a text link is a link.
 */
const buttonShape = cva(
  [
    'hit-area relative inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-control font-medium whitespace-nowrap outline-none select-none',
    'transition-[background-color,border-color,color,box-shadow,opacity,transform,scale,--tw-gradient-from]',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24 active:not-aria-[haspopup]:scale-[0.96]',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    'disabled:pointer-events-none disabled:text-disabled-foreground',
  ],
  {
    variants: {
      emphasis: {
        // Kumo's emphasis button: a top-down gradient from 15% lighter to the fill, a 1px inset highlight (30% lighter)
        // along the top edge, a 10% darker edge; hover lifts the gradient's top to the highlight shade.
        solid: [
          'border-[color-mix(in_oklch,var(--intent-solid),black_10%)] bg-linear-to-b from-[color-mix(in_oklch,var(--intent-solid),white_15%)] to-(--intent-solid) shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--intent-solid),white_30%)] hover:from-[color-mix(in_oklch,var(--intent-solid),white_30%)]',
          'disabled:border-transparent disabled:bg-disabled disabled:bg-none disabled:shadow-none',
        ],
        subtle: 'disabled:bg-disabled',
        outline: 'disabled:inset-ring-border',
        ghost: '',
        // `intentVariants` paints the fill and the inset edge; the transparent border only keeps the size of the others.
        raised: 'bg-clip-border disabled:bg-transparent disabled:shadow-[inset_0_0_0_1px_var(--border)]',
      },
      // Heights 32 / 36 / 40 / 44, the same as fields. The radius follows the height (`rounded-control*`). Padding: 16px
      // (12px at `xs`), 2px less on the icon side (an icon reads lighter than text). Focus: the fields' soft 24% ring.
      size: {
        default:
          'h-10 gap-1.5 rounded-control-lg px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        xs: "h-8 gap-1 rounded-control px-3 text-caption has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: 'h-9 gap-1 rounded-control px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        lg: 'h-11 gap-1.5 rounded-control-lg px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        // Icon-only sizes match the text sizes, so a row of both lines up.
        'icon-xs': 'size-8 rounded-control',
        'icon-sm': 'size-9 rounded-control',
        icon: 'size-10 rounded-control-lg',
        'icon-lg': 'size-11 rounded-control-lg',
      },
    },
    defaultVariants: { emphasis: 'solid', size: 'default' },
  },
);

type ButtonSize = NonNullable<Parameters<typeof buttonShape>[0]>['size'] & string;

/** The names before `intent` × `emphasis`. Kept until the app migrates; each is one pair. */
const VARIANTS = {
  default: { intent: 'primary', emphasis: 'solid' },
  secondary: { intent: 'neutral', emphasis: 'raised' },
  ghost: { intent: 'neutral', emphasis: 'ghost' },
  destructive: { intent: 'destructive', emphasis: 'solid' },
  /** @deprecated `secondary`. */
  outline: { intent: 'neutral', emphasis: 'raised' },
  /** @deprecated `secondary`. */
  surface: { intent: 'neutral', emphasis: 'raised' },
  /** @deprecated `ghost`. */
  muted: { intent: 'neutral', emphasis: 'ghost' },
  /** @deprecated `ghost` in a `text-muted-foreground` container. */
  toolbar: { intent: 'neutral', emphasis: 'ghost' },
} as const satisfies Record<string, { intent: Intent; emphasis: Emphasis }>;

type ButtonVariant = keyof typeof VARIANTS;

interface ButtonStyleProps {
  /** @deprecated Use `intent` and `emphasis`. */
  variant?: ButtonVariant | null;
  intent?: Intent | null;
  emphasis?: Emphasis | null;
  size?: ButtonSize | null;
  className?: string;
}

const resolve = ({ variant, intent, emphasis }: ButtonStyleProps): { intent: Intent; emphasis: Emphasis } => {
  const base = VARIANTS[variant ?? 'default'];
  return { intent: intent ?? base.intent, emphasis: emphasis ?? base.emphasis };
};

function buttonVariants(props: ButtonStyleProps = {}): string {
  const { intent, emphasis } = resolve(props);
  return cn(
    intentVariants({ intent, emphasis, interactive: true }),
    buttonShape({ emphasis, size: props.size }),
    // A neutral ghost keeps its container's text color at rest: a muted toolbar sets `text-muted-foreground` once.
    intent === 'neutral' &&
      emphasis === 'ghost' &&
      'text-current hover:text-foreground aria-expanded:text-foreground aria-pressed:text-foreground',
    props.variant === 'toolbar' && 'text-muted-foreground',
    props.className,
  );
}

/** The spinner follows the icon size: 16px in the 32 and 36px buttons, 20px from 40px up. */
const LOADER_SIZE: Record<ButtonSize, number> = {
  xs: 16,
  sm: 16,
  'icon-xs': 16,
  'icon-sm': 16,
  default: 20,
  lg: 20,
  icon: 20,
  'icon-lg': 20,
};

/** A pending state shows at least this long, so a fast request does not flash the spinner. */
const MIN_PENDING_MS = 800;

/** `pending`, held true until it has been true for `MIN_PENDING_MS`. */
function useMinimumPending(pending: boolean): boolean {
  const [shown, setShown] = React.useState(pending);
  const since = React.useRef<number | null>(pending ? Date.now() : null);
  React.useEffect(() => {
    if (pending) {
      since.current ??= Date.now();
      setShown(true);
      return;
    }
    if (since.current === null) return;
    const remaining = MIN_PENDING_MS - (Date.now() - since.current);
    const done = () => {
      since.current = null;
      setShown(false);
    };
    if (remaining <= 0) {
      done();
      return;
    }
    const timer = setTimeout(done, remaining);
    return () => clearTimeout(timer);
  }, [pending]);
  return pending || shown;
}

/**
 * Emil Kowalski's roll, on one spring for both sides, so a quick toggle reverses from where it is. The roll arrives in
 * 180ms (`visualDuration`) and overshoots a little before it settles; the fade does not bounce.
 */
const pendingSwap: Transition = {
  type: 'spring',
  visualDuration: 0.18,
  bounce: 0.25,
  opacity: { type: 'spring', visualDuration: 0.12, bounce: 0 },
};

/**
 * The label and the spinner roll through the button's box: pending, the label leaves through the top edge while the
 * spinner comes in through the bottom; done, the reverse. Each side is the box's full height, so `y: ±100%` takes it
 * all the way out. The label keeps the width. Reduced motion: only the fades.
 */
function PendingSwap({ pending, size, children }: { pending: boolean; size: ButtonSize; children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const above = reduced ? { opacity: 0 } : { opacity: 0, y: '-100%' };
  const below = reduced ? { opacity: 0 } : { opacity: 0, y: '100%' };
  return (
    <>
      {/* The label's window: in flow for the width, the button's full height, clipped top and bottom.
          `gap-[inherit]`: the label's parts keep the button's gap. */}
      <span className='inline-flex gap-[inherit] self-stretch overflow-y-clip'>
        {/* Hidden by motion only: the label stays the button's accessible name while it is pending (`aria-busy`). */}
        <motion.span
          data-slot='button-label'
          className='inline-flex items-center justify-center gap-[inherit]'
          initial={false}
          animate={pending ? above : { opacity: 1, y: 0 }}
          transition={pendingSwap}>
          {children}
        </motion.span>
      </span>
      <span className='pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]'>
        <AnimatePresence initial={false}>
          {pending && (
            <motion.span
              key='spinner'
              className='absolute inset-0 flex items-center justify-center'
              initial={below}
              animate={{ opacity: 1, y: 0 }}
              exit={below}
              transition={pendingSwap}>
              <Loader size={LOADER_SIZE[size]} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </>
  );
}

type ButtonProps = ButtonPrimitive.Props & Omit<ButtonStyleProps, 'className'> & { isLoading?: boolean };

function Button({
  className,
  variant,
  intent,
  emphasis,
  size = 'default',
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const pending = useMinimumPending(isLoading === true);
  const resolved = resolve({ variant, intent, emphasis });
  return (
    <ButtonPrimitive
      type='submit'
      data-slot='button'
      data-intent={resolved.intent}
      data-emphasis={resolved.emphasis}
      data-size={size}
      // Custom render elements (e.g. router <Link>) are not native <button>s; Base UI
      // needs nativeButton=false there to apply ARIA button semantics instead.
      nativeButton={props.render === undefined}
      className={(state) =>
        buttonVariants({
          variant,
          intent,
          emphasis,
          size,
          className: typeof className === 'function' ? className(state) : className,
        })
      }
      aria-busy={pending || undefined}
      {...props}>
      {/* Only a button that can go pending wraps its label, so every other button keeps its children as they are. */}
      {isLoading === undefined ? (
        children
      ) : (
        <PendingSwap pending={pending} size={size ?? 'default'}>
          {children}
        </PendingSwap>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, type ButtonProps, type ButtonVariant };
