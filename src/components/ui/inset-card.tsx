import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/lib/utils';

// Springs, not fixed durations: `show` can flip rapidly, and a spring keeps its velocity through an interrupted
// animation. restDelta/restSpeed sit below Motion's pixel-tuned defaults because gridTemplateRows only spans 0–1fr;
// the defaults stop ~1% off target and the final snap reads as a stutter.
const insetCardRevealTransition = {
  type: 'spring',
  duration: 0.3,
  bounce: 0.25,
  restDelta: 0.001,
  restSpeed: 0.01,
} as const;
/** Also for collapses elsewhere in a card (`FieldReveal`), so they run on the same spring as the footer. */
const insetCardCollapseTransition = {
  type: 'spring',
  duration: 0.15,
  bounce: 0,
  restDelta: 0.001,
  restSpeed: 0.01,
} as const;

// grid-template-rows (0fr ↔ 1fr), not height (0 ↔ auto): animating to/from "auto" makes Motion spring a px value, then
// swap the inline style back to `height: auto`; that swap is a stutter on the last frame. fr values interpolate directly.
const gridCollapsed = { gridTemplateRows: '0fr', opacity: 0 } as const;
const gridExpanded = { gridTemplateRows: '1fr', opacity: 1 } as const;

// Geometry: the shell is `rounded-card` and sets `--outer-radius` / `--outer-inset` (4px, `p-1`); the content takes
// `rounded-inner`, so it stays concentric at any tuned card radius.
//
// Text edge: content starts inside the card's 1px edge (`cardSurface`), so what sits on the shell (header, footer) pads
// `group` + 1px. Content padded `group` and header text then share one edge, as do header and row actions.
const shellTextInset = 'px-[calc(var(--spacing-group)+1px)]';

/**
 * Start padding that lines text up with the card header's text: the shell inset (`p-1`), the card edge (1px) and
 * `group`. For text outside the card that should share that edge, such as a section header above it.
 */
export const alignToInsetCardText = 'px-[calc(--spacing(1)+1px+var(--spacing-group))]';

/**
 * The shell (`--inset-card-shell`, default `--shell`) wraps the content on every side, so the content's corners sit on
 * the shell, never on the page; restyle the tint by setting the variable. `intent='destructive'` marks only the title.
 */
function InsetCard({
  className,
  intent = 'neutral',
  ...props
}: ComponentProps<'section'> & { intent?: 'neutral' | 'destructive' }) {
  return (
    <section
      data-slot='inset-card'
      data-intent={intent}
      className={cn(
        'group/inset-card rounded-card bg-(--inset-card-shell) p-1 [--inset-card-shell:var(--shell)] [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-card)]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A compact label strip on the shell, not a second surface: one line by default. Keep descriptions to one sentence;
 * long copy makes the shell read as a gray block. Title and description sit flush: the line height is the gap.
 */
function InsetCardHeader({ className, actions, children, ...props }: ComponentProps<'div'> & { actions?: ReactNode }) {
  if (actions === undefined) {
    return (
      <div className={cn(shellTextInset, 'py-2.5', className)} {...props}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={cn('flex min-h-11 items-center justify-between gap-group py-1.5', shellTextInset, className)}
      {...props}>
      <div className='min-w-0'>{children}</div>
      {/* A one-line strip is 44px with 32px actions. They end on the same line as the actions of flush rows below
          (shell 4 + edge 1 + `group`), so header and row actions form one column; their own radius, since their inset
          is not even. */}
      <div className='flex shrink-0 items-center gap-1'>{actions}</div>
    </div>
  );
}

/** Springs open and closed with `show`. */
function InsetCardFooter({ className, show = true, children, ...props }: ComponentProps<'div'> & { show?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          data-slot='inset-card-footer'
          initial={shouldReduceMotion ? false : gridCollapsed}
          animate={{ ...gridExpanded, transition: insetCardRevealTransition }}
          exit={shouldReduceMotion ? { opacity: 0 } : { ...gridCollapsed, transition: insetCardCollapseTransition }}
          className='grid overflow-hidden'>
          {/* min-h-0: grid items default to min-height:auto and would refuse to collapse to 0fr. */}
          <div className='min-h-0 overflow-hidden'>
            {/* A margin on the child, not padding on the grid item: padding floors the grid track and the exit spring
                stalls before unmount. */}
            <div className={cn('mb-1 pt-2', shellTextInset, className)} {...props}>
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
        'text-body font-medium text-balance group-data-[intent=destructive]/inset-card:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

// overflow-hidden clips the selection highlight to the paragraph; without it the gap between wrapped lines is painted
// to the page edge when a drag starts outside the text.
function InsetCardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('max-w-prose overflow-hidden text-body text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

// The card's edge is an `--edge` border inside the box, as the `Table` card body draws it: `bg-clip-padding` keeps the
// fill inside the border, so the translucent edge sits on the shell behind it. No drop: the whole shell inset (4px)
// shows as rim, and the edge stays crisp.
const cardSurface = 'border border-(--edge) bg-card bg-clip-padding';

/**
 * The card inside the shell. `data-surface='card'` scopes the surface tokens (`bg-field`, `bg-muted`, …) to it. The
 * bottom radius stays fixed whether a footer is mounted, so its reveal never changes the content's shape mid-animation.
 */
function InsetCardContent({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'inset-card-content', surface: 'card' },
    props: mergeProps<'div'>({ className: cn('rounded-inner', cardSurface, className) }, props),
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
};
