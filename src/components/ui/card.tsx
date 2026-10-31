import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactNode } from 'react';

import { usePresence } from '~/hooks/use-presence';
import { cn } from '~/lib/utils';

// Geometry: the shell is `rounded-card` and sets `--outer-radius` / `--outer-inset` (`p-card-inset`); the content takes
// `rounded-inner`, so it stays concentric at any tuned card radius or inset. Without a shell it falls back to
// `rounded-card` (a list under a plain section title); an `--outer-radius` / `--outer-inset` set on or above it wins.
//
// Text edge: content starts inside the card's 1px edge, so what sits on the shell (header, footer) pads `card` + 1px
// (`px-[calc(var(--spacing-card)+1px)]`). Content padded `p-card` and header text then share one edge, as do header and
// row actions. Text outside the card that shares the edge (a section title) pads the shell's inset on top.
//
// Fields (`rounded-control`) sit `card` + 1px into the content corner: too far in to be concentric, and the corners
// differ enough to read as two layers.

/**
 * The shell (`--card-shell`, default `--shell`) wraps the content on every side, so the content's corners sit on
 * the shell, never on the page; restyle the tint by setting the variable. `intent='destructive'` marks only the title.
 */
function Card({
  className,
  intent = 'neutral',
  ...props
}: ComponentProps<'section'> & { intent?: 'neutral' | 'destructive' }) {
  return (
    <section
      data-slot='card'
      data-intent={intent}
      className={cn(
        'group/card rounded-card bg-(--card-shell) p-card-inset [--card-shell:var(--shell)] [--outer-inset:var(--spacing-card-inset)] [--outer-radius:var(--radius-card)]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A label strip on the shell, not a second surface: one line by default. Keep descriptions to one sentence; long copy
 * makes the shell read as a gray block. Title and description sit flush: the line height is the gap. `group` above and
 * below the text, so the strip has the content's rhythm.
 */
function CardHeader({ className, actions, children, ...props }: ComponentProps<'div'> & { actions?: ReactNode }) {
  if (actions === undefined) {
    return (
      <div data-slot='card-header' className={cn('px-[calc(var(--spacing-card)+1px)] py-group', className)} {...props}>
        {children}
      </div>
    );
  }
  return (
    <div
      data-slot='card-header'
      className={cn(
        'flex items-center justify-between gap-group px-[calc(var(--spacing-card)+1px)] py-group',
        className,
      )}
      {...props}>
      <div className='min-w-0'>{children}</div>
      {/* Negative margin: `control-sm` actions overhang the title's 20px line instead of growing the strip, so a
          header is as tall with actions as without. They end on the same line as the actions of flush rows below
          (shell inset + edge 1 + `card`), so header and row actions form one column. */}
      <div className='-my-[calc((var(--spacing-control-sm)-1.25rem)/2)] flex shrink-0 items-center gap-related'>
        {actions}
      </div>
    </div>
  );
}

/**
 * Springs open and closed with `show`. The header mirrored: `group` from the content, `group` + the shell's inset from
 * the edge; the sides on the content's text edge.
 */
function CardFooter({ className, show = true, children, ...props }: ComponentProps<'div'> & { show?: boolean }) {
  const presence = usePresence<HTMLDivElement>(show);
  if (!presence.mounted) return null;
  return (
    // grid-template-rows (0fr ↔ 1fr), not height: a fold to `auto` without measuring.
    <div
      ref={presence.ref}
      data-slot='card-footer'
      data-leaving={presence.leaving || undefined}
      className={cn(
        'grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-fold ease-spring-bounce',
        'data-leaving:opacity-0 data-leaving:duration-fold-sm data-leaving:ease-spring motion-safe:data-leaving:grid-rows-[0fr]',
        'motion-reduce:duration-fold-sm motion-reduce:ease-enter',
        presence.entering && 'starting:opacity-0 motion-safe:starting:grid-rows-[0fr]',
      )}>
      {/* min-h-0: grid items default to min-height:auto and would refuse to collapse to 0fr. */}
      <div className='min-h-0 overflow-hidden'>
        {/* A margin on the child, not padding on the grid item: padding floors the grid track and the fold stalls
          before unmount. */}
        <div className={cn('mb-group px-[calc(var(--spacing-card)+1px)] pt-group', className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}

function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      data-slot='card-title'
      className={cn(
        // 14 / 20 semibold, the description 14 / 20 below it: a compact label for the strip, heavier than row titles.
        'text-body leading-5 font-semibold text-balance group-data-[intent=destructive]/card:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

// overflow-hidden clips the selection highlight to the paragraph; without it the gap between wrapped lines is painted
// to the page edge when a drag starts outside the text.
function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='card-description'
      className={cn('max-w-prose overflow-hidden text-body leading-5 text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

/**
 * The card inside the shell. Its edge is an `--edge` border inside the box, as the `Table` card body draws it:
 * `bg-clip-padding` keeps the fill inside the border, so the translucent edge sits on the shell behind it. `shadow-card`
 * adds a small drop and weights the bottom edge (lights the top in dark), so the card sits on the shell. `data-surface='card'` scopes the surface tokens
 * (`bg-field`, `bg-muted`, …) to it. The bottom radius stays fixed whether a footer is mounted, so its reveal never
 * changes the content's shape mid-animation.
 */
function CardContent({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'card-content', surface: 'card' },
    props: mergeProps<'div'>(
      {
        className: cn(
          'rounded-[max(0px,calc(var(--outer-radius,var(--radius-card))-var(--outer-inset,0px)))] border border-(--edge) bg-card bg-clip-padding shadow-card',
          className,
        ),
      },
      props,
    ),
  });
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
