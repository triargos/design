import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/lib/utils';

// Spring, not a fixed duration: `show` can flip rapidly, and a spring keeps its
// velocity through an interrupted animation. restDelta/restSpeed are tightened
// below Motion's pixel-tuned defaults because gridTemplateRows only spans 0–1fr;
// the defaults stop ~1% off target and the final snap reads as a stutter.
// Exported so sibling collapses inside the card run on the identical spring.
const insetCardRevealTransition = {
  type: 'spring',
  duration: 0.3,
  bounce: 0.25,
  restDelta: 0.001,
  restSpeed: 0.01,
} as const;
const insetCardCollapseTransition = {
  type: 'spring',
  duration: 0.15,
  bounce: 0,
  restDelta: 0.001,
  restSpeed: 0.01,
} as const;

// grid-template-rows (0fr ↔ 1fr), not height (0 ↔ auto): animating to/from
// "auto" makes Motion measure the box, spring a px value, then swap the
// inline style back to `height: auto` once it "completes" — that swap is a
// stutter on the last frame. fr values interpolate directly, no swap.
const gridCollapsed = { gridTemplateRows: '0fr', opacity: 0 } as const;
const gridExpanded = { gridTemplateRows: '1fr', opacity: 1 } as const;

// The shell (`--inset-card-shell`, default `--shell`) wraps the content on every side, so the
// content's corners sit on the shell, never on the page. Restyle the tint by setting the variable.
// A destructive card marks only its title as destructive.
//
// Geometry: the shell is `rounded-card` and sets `--outer-radius` / `--outer-inset` (4px, `p-1`); the content takes
// `rounded-inner`, so it stays concentric (content radius = shell radius − inset) at any tuned card radius.
//
// Text edge: content starts inside the card's 1px edge (`cardSurface`), so what sits on the shell (header, footer)
// pads `group` + 1px. Content padded `group` and header text then share one edge, as do header and row actions.

/**
 * Start padding that lines text up with the card header's text: the shell inset (`p-1`), the card edge (1px) and
 * `group`. For text outside the card that should share that edge, such as a section header above it.
 */
export const alignToInsetCardText = 'px-[calc(--spacing(1)+1px+var(--spacing-group))]';

function InsetCard({
  className,
  tone = 'default',
  ...props
}: ComponentProps<'section'> & { tone?: 'default' | 'destructive' }) {
  return (
    <section
      data-slot='inset-card'
      data-tone={tone}
      className={cn(
        'group/inset-card rounded-card bg-(--inset-card-shell) p-1 [--inset-card-shell:var(--shell)] [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-card)]',
        className,
      )}
      {...props}
    />
  );
}

// The header is a compact label strip on the shell, not a second surface: one line by default.
// Keep descriptions short (one sentence) — long copy is what makes the shell read as a gray block.
// Title and description sit flush: the line height is the gap.
function InsetCardHeader({ className, actions, children, ...props }: ComponentProps<'div'> & { actions?: ReactNode }) {
  if (actions === undefined) {
    return (
      <div className={cn('px-[calc(var(--spacing-group)+1px)] py-2.5', className)} {...props}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex min-h-11 items-center justify-between gap-group px-[calc(var(--spacing-group)+1px)] py-1.5',
        className,
      )}
      {...props}>
      <div className='min-w-0'>{children}</div>
      {/* A one-line strip is 44px with 32px actions. They end on the same line as the actions of flush rows below
          (shell 4 + edge 1 + `group`), so header and row actions form one column; their own radius, since their inset is not
          even. */}
      <div className='flex shrink-0 items-center gap-1'>{actions}</div>
    </div>
  );
}

/**
 * When flipping `show` coincides with a collapse/expand elsewhere in the
 * card, run that sibling animation on the exported collapse transition and
 * pass `bounce={false}` here so both edges move in lockstep. Bounce must be
 * off in that case: the collapsing sibling clamps at 0fr and can't mirror
 * the overshoot, so the footer settling back from past 1fr would nudge the
 * card edge up a few pixels at the end.
 */
function InsetCardFooter({
  className,
  show = true,
  bounce = true,
  children,
  ...props
}: ComponentProps<'div'> & { show?: boolean; bounce?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          data-slot='inset-card-footer'
          initial={shouldReduceMotion ? false : gridCollapsed}
          animate={{ ...gridExpanded, transition: bounce ? insetCardRevealTransition : insetCardCollapseTransition }}
          exit={shouldReduceMotion ? { opacity: 0 } : { ...gridCollapsed, transition: insetCardCollapseTransition }}
          className='grid overflow-hidden'>
          {/* min-h-0: grid items default to min-height:auto and would refuse to collapse to 0fr. */}
          <div className='min-h-0 overflow-hidden'>
            {/* Must be a margin on the child, not padding on the grid item: padding
                floors the grid track and the exit spring stalls before unmount. */}
            <div className={cn('mb-1 px-[calc(var(--spacing-group)+1px)] pt-2', className)} {...props}>
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InsetCardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'text-body font-medium text-balance group-data-[tone=destructive]/inset-card:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

// overflow-hidden clips the selection highlight to the paragraph; without it the
// gap between wrapped lines is painted to the page edge when a drag starts
// outside the text.
function InsetCardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('max-w-prose overflow-hidden text-body text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

const insetCardContentSlot = { 'data-slot': 'inset-card-content', 'data-surface': 'card' };

// The card's edge is an `--edge` border inside the box, as the `Table` card body draws it: `bg-clip-padding` keeps the
// fill inside the border, so the translucent edge sits on the shell behind it. No drop: the whole shell inset (4px)
// shows as rim, and the edge stays crisp.
const cardSurface = 'border border-(--edge) bg-card bg-clip-padding';

// The bottom radius stays fixed whether a footer is mounted, so its reveal never changes the
// content's shape mid-animation.
function InsetCardContent({ className, render, ...props }: useRender.ComponentProps<'div'> & ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        // `data-surface` scopes the surface tokens (`bg-field`, `bg-muted`, …) to the card. Spread from a
        // const: the props type has no `data-*` keys, so a literal fails the excess check.
        ...insetCardContentSlot,
        className: cn('rounded-inner', cardSurface, className),
      },
      props,
    ),
    render,
  });
}

export {
  cardSurface,
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardFooter,
  InsetCardHeader,
  InsetCardTitle,
  insetCardCollapseTransition,
  insetCardRevealTransition,
};
