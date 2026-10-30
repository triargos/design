import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { AnimatePresence, LazyMotion, m, type Transition, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { type Emphasis, type Intent, intentVariants } from '~/components/ui/intent-variants';
import { Spinner } from '~/components/ui/spinner';

import { loadMotionFeatures } from '~/lib/motion/load';
import { cn } from '~/lib/utils';

/**
 * An `intent` (what the action means) at an `emphasis` (how much it weighs); `emphasis` defaults to `raised` for
 * `neutral` and to `solid` for every other intent. Which one to pick: DESIGN.md, Components › Button.
 */
const buttonShape = cva(
  [
    'hit-area relative inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-border text-control font-medium whitespace-nowrap outline-none select-none',
    'transition-[background-color,border-color,color,box-shadow,opacity,transform,scale,--tw-gradient-from]',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon",
    'disabled:pointer-events-none disabled:text-disabled-foreground',
  ],
  {
    variants: {
      emphasis: {
        // A top-down gradient from 15% lighter to the fill, a 1px inset highlight (30% lighter) along the top edge, a
        // 10% darker edge; hover lifts the gradient's top to the highlight shade. The fill stops at the edge; disabled has
        // no edge, so its fill takes the whole box.
        solid: [
          'border-[color-mix(in_oklch,var(--intent-solid),black_10%)] bg-clip-padding bg-linear-to-b from-[color-mix(in_oklch,var(--intent-solid),white_15%)] to-(--intent-solid) shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--intent-solid),white_30%)] hover:from-[color-mix(in_oklch,var(--intent-solid),white_30%)]',
          'disabled:border-transparent disabled:bg-disabled disabled:bg-clip-border disabled:bg-none disabled:shadow-none',
        ],
        subtle: 'disabled:bg-disabled',
        // The edge is the border, not `intentVariants`' inset ring: an inset ring paints inside the border, 2px short.
        outline: 'border-(--intent-border) inset-ring-0 disabled:border-border',
        ghost: '',
        // The `--edge` is the border, inside the box, as on a field: the raised ring would sit outside it and draw the
        // button 2px taller than the others. The fill runs under the edge, so the edge darkens the button's own fill: on a
        // saturated surface an edge over the surface would vanish and leave the fill 2px short.
        // `shadow-raised-drop` is the raised drop without the ring.
        raised: [
          'border-(--edge) bg-clip-border shadow-raised-drop',
          'hover:border-(--edge-hover) hover:shadow-raised-drop-hover aria-expanded:border-(--edge-hover) aria-expanded:shadow-raised-drop-hover',
          'disabled:border-border disabled:bg-transparent disabled:shadow-none',
        ],
      },
      // Heights `control-xs` / `control-sm` / `control` / `control-lg`; the default is a field's height. The radius follows
      // the height (`rounded-control*`). Padding: `control-pad` (`control-pad-sm` at `sm`, `control-pad-xs` at `xs`), 2px
      // less on the icon side (an icon reads lighter than text). On touch, `hit-area` grows the target to 44px. Focus:
      // the fields' soft 24% ring.
      size: {
        default:
          'h-control gap-control-gap rounded-control px-control-pad has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad)-2px)]',
        xs: "h-control-xs gap-control-gap-sm rounded-control-sm px-control-pad-xs text-caption has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad-xs)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad-xs)-2px)] [&_svg:not([class*='size-'])]:size-icon-xs",
        sm: "h-control-sm gap-control-gap-sm rounded-control px-control-pad-sm text-caption has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad-sm)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad-sm)-2px)] [&_svg:not([class*='size-'])]:size-icon-sm",
        lg: 'h-control-lg gap-control-gap rounded-control-lg px-control-pad has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad)-2px)]',
        // Icon-only sizes match the text sizes, so a row of both lines up.
        'icon-sm': 'size-control-sm rounded-control',
        icon: 'size-control rounded-control',
        'icon-lg': 'size-control-lg rounded-control-lg',
      },
      /** Scales to 96% on press, except a menu trigger. `static` keeps it still, where the motion would distract. */
      static: {
        false: 'active:not-aria-[haspopup]:scale-[0.96] motion-reduce:active:not-aria-[haspopup]:scale-100',
        true: '',
      },
    },
    defaultVariants: { size: 'default', static: false },
  },
);

type ButtonSize = NonNullable<Parameters<typeof buttonShape>[0]>['size'] & string;

/** The spinner follows the icon size: `icon-xs` at `xs`, `icon` in the `sm` and default buttons, `icon-lg` at `lg`. */
const SPINNER_SIZE: Record<ButtonSize, string> = {
  xs: 'size-icon-xs',
  sm: 'size-icon',
  'icon-sm': 'size-icon',
  default: 'size-icon',
  icon: 'size-icon',
  lg: 'size-icon-lg',
  'icon-lg': 'size-icon-lg',
};

interface ButtonStyleProps {
  intent?: Intent | undefined;
  emphasis?: Emphasis | undefined;
  size?: ButtonSize | undefined;
  /** No scale on press. */
  static?: boolean | undefined;
  className?: string | undefined;
}

/** The button classes, for an element that must stay itself (a toolbar part, a calendar day). */
function buttonVariants({
  intent = 'neutral',
  emphasis,
  size,
  static: isStatic,
  className,
}: ButtonStyleProps = {}): string {
  const resolvedEmphasis = emphasis ?? (intent === 'neutral' ? 'raised' : 'solid');
  return cn(
    intentVariants({ intent, emphasis: resolvedEmphasis, interactive: true }),
    buttonShape({ emphasis: resolvedEmphasis, size, static: isStatic }),
    // A neutral ghost keeps its container's text color at rest: a muted toolbar sets `text-muted-foreground` once.
    intent === 'neutral' &&
      resolvedEmphasis === 'ghost' &&
      'text-current hover:text-foreground aria-expanded:text-foreground aria-pressed:text-foreground',
    className,
  );
}

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

/** One spring for both sides, so a quick toggle reverses from where it is. The roll arrives in 180ms, no overshoot. */
const pendingSwap: Transition = {
  type: 'spring',
  visualDuration: 0.18,
  bounce: 0,
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
    <LazyMotion features={loadMotionFeatures}>
      {/* The label's window: in flow for the width, the button's full height, clipped top and bottom.
          `gap-[inherit]`: the label's parts keep the button's gap. */}
      <span className='inline-flex gap-[inherit] self-stretch overflow-y-clip'>
        {/* Hidden by motion only: the label stays the button's accessible name while it is pending (`aria-busy`). */}
        <m.span
          data-slot='button-label'
          className='inline-flex items-center justify-center gap-[inherit]'
          initial={false}
          animate={pending ? above : { opacity: 1, y: 0 }}
          transition={pendingSwap}>
          {children}
        </m.span>
      </span>
      <span className='pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]'>
        <AnimatePresence initial={false}>
          {pending && (
            <m.span
              key='spinner'
              className='absolute inset-0 flex items-center justify-center'
              initial={below}
              animate={{ opacity: 1, y: 0 }}
              exit={below}
              transition={pendingSwap}>
              {/* The CSS size wins over `size`. */}
              <Spinner className={SPINNER_SIZE[size]} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
    </LazyMotion>
  );
}

type ButtonProps = ButtonPrimitive.Props & Omit<ButtonStyleProps, 'className'> & { isLoading?: boolean };

/** A native `type='button'` unless the caller passes `type='submit'`. */
function Button({
  className,
  intent,
  emphasis,
  size = 'default',
  static: isStatic,
  isLoading,
  disabled,
  focusableWhenDisabled,
  children,
  ...props
}: ButtonProps) {
  const pending = useMinimumPending(isLoading === true);
  // A router `<Link to>` or an `<a href>` stays a link for assistive tech; Base UI would announce it as a button.
  const renderProps = React.isValidElement(props.render) ? (props.render.props as Record<string, unknown>) : undefined;
  const isLink = renderProps !== undefined && ('to' in renderProps || 'href' in renderProps);
  return (
    <ButtonPrimitive
      data-slot='button'
      data-size={size}
      // A custom `render` (a router `Link`) is not a native button: Base UI then adds the button role and keys.
      nativeButton={props.render === undefined}
      className={(state) =>
        buttonVariants({
          intent,
          emphasis,
          size,
          static: isStatic,
          className: typeof className === 'function' ? className(state) : className,
        })
      }
      // A pending button takes no second click and keeps focus: Base UI sets `aria-disabled` instead of the `disabled`
      // attribute, so the `disabled:` styles do not replace the spinner.
      disabled={disabled || pending}
      focusableWhenDisabled={pending || focusableWhenDisabled}
      aria-busy={pending || undefined}
      // Spread, not `role={undefined}`: Base UI's `mergeProps` copies `undefined` over its own `role='button'`.
      {...(isLink && { role: 'link' })}
      {...props}>
      {/* Only a button that can go pending wraps its label, so every other button keeps its children as they are. */}
      {isLoading === undefined ? (
        children
      ) : (
        <PendingSwap pending={pending} size={size}>
          {children}
        </PendingSwap>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, type ButtonProps };
